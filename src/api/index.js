const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const authFactory = require("../middleware/auth");
const requireRole = require("../middleware/rbac");
const { defaultPimPages, juniorTemplate } = require("./helpers/pimDefaults");
const {
	pickUser,
	issueToken,
	setSessionCookie,
	clearSessionCookie,
} = require("./helpers/authTokens");
const { writeAuditLog } = require("./helpers/auditLogs");
const {
	ALLOWED_ROLES,
	normalizeInputRole,
	toDbRole,
	canCreateTargetRole,
} = require("../services/roleService");
const { resolveTimelineSource } = require("../services/timelineSourceService");
const { seedPimDefaults } = require("../services/pimSeedService");

const DEFAULT_CREATED_USER_PASSWORD = "ChangeMe123!";

module.exports = function buildApi(app) {
	const router = express.Router();
	const auth = authFactory(app);
	const models = app.database.models;

	router.get("/health", (_req, res) => {
		res.json({ ok: true, service: "pim-marsha-api" });
	});

	router.get(
		"/organizations",
		auth,
		requireRole("responsable"),
		async (_req, res) => {
			const organizations = await models.organizations.findAll({
				order: [["createdAt", "DESC"]],
			});
			return res.json({ organizations });
		},
	);

	router.post(
		"/organizations",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const { name, logoKey } = req.body;
			if (!name || !logoKey)
				return res
					.status(400)
					.json({ message: "Champs requis manquants" });
			const organization = await models.organizations.create({
				name,
				logoKey,
			});
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "ORGANIZATION_CREATE",
				resourceType: "organization",
				resourceId: organization.id,
				metadata: { name: organization.name },
			});
			return res.status(201).json({ organization });
		},
	);

	router.patch(
		"/organizations/:id",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const organization = await models.organizations.findByPk(
				req.params.id,
			);
			if (!organization)
				return res
					.status(404)
					.json({ message: "Organisation introuvable" });
			await organization.update(req.body);
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "ORGANIZATION_UPDATE",
				resourceType: "organization",
				resourceId: organization.id,
				metadata: { changed: Object.keys(req.body || {}) },
			});
			return res.json({ organization });
		},
	);

	router.delete(
		"/organizations/:id",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const deleted = await models.organizations.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res
					.status(404)
					.json({ message: "Organisation introuvable" });
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "ORGANIZATION_DELETE",
				resourceType: "organization",
				resourceId: req.params.id,
			});
			return res.status(204).send();
		},
	);

	router.post("/auth/register", async (req, res) => {
		// Registration gate
		const { email, name, firstName, lastName, password, role } = req.body;
		if (!email || (!name && (!firstName || !lastName)) || !password) {
			return res.status(400).json({ message: "Champs requis manquants" });
		}

		const usersCount = await models.users.count();
		const requestedRole = normalizeInputRole(role || "membre");
		if (!ALLOWED_ROLES.includes(requestedRole)) {
			return res.status(400).json({ message: "Role invalide" });
		}

		if (usersCount > 0) {
			const header = req.headers.authorization || "";
			const bearerToken = header.startsWith("Bearer ")
				? header.slice(7)
				: null;
			const cookieToken = req.cookies?.[app.config.cookie.name] || null;
			const token = bearerToken || cookieToken;

			if (!token) {
				return res.status(401).json({
					message: "Token manquant pour creer un utilisateur",
				});
			}

			try {
				const payload = jwt.verify(token, app.config.jwtSecret);
				if (
					!["super_admin", "owner", "responsable"].includes(
						payload.role,
					)
				) {
					return res.status(403).json({
						message: "Role insuffisant pour creer un utilisateur",
					});
				}
			} catch {
				return res.status(401).json({ message: "Token invalide" });
			}
		}

		const exists = await models.users.findOne({ where: { email } });
		if (exists) {
			return res
				.status(409)
				.json({ message: "Utilisateur deja existant" });
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await models.users.create({
			email,
			name: name || `${firstName} ${lastName}`,
			firstName: firstName || name,
			lastName: lastName || name,
			passwordHash,
			role: usersCount === 0 ? "SUPER_ADMIN" : toDbRole(requestedRole),
		});

		return res.status(201).json({ user: pickUser(user) });
	});

	router.post("/auth/login", async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email et mot de passe requis" });
		}

		const user = await models.users.findOne({ where: { email } });
		if (!user) {
			return res.status(401).json({ message: "Identifiants invalides" });
		}
		if (user.isActive === false) {
			return res.status(403).json({
				message: "Ce compte est inactif. Contacte un administrateur.",
			});
		}

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) {
			return res.status(401).json({ message: "Identifiants invalides" });
		}

		await user.update({ lastLoginAt: new Date() });

		const token = issueToken(app, user);
		setSessionCookie(app, res, token);
		await writeAuditLog(app, {
			actorId: user.id,
			actorEmail: user.email,
			actionType: "LOGIN",
			resourceType: "auth",
			resourceId: user.id,
			metadata: {
				userAgent: req.headers["user-agent"] || null,
				ip: req.ip || req.socket?.remoteAddress || null,
			},
		});

		return res.json({ token, user: pickUser(user) });
	});

	router.post("/auth/logout", auth, async (_req, res) => {
		await writeAuditLog(app, {
			actorId: _req.auth?.sub,
			actorEmail: _req.auth?.email,
			actionType: "LOGOUT",
			resourceType: "auth",
			resourceId: _req.auth?.sub,
		});
		clearSessionCookie(app, res);
		return res.status(204).send();
	});

	router.get("/auth/me", auth, async (req, res) => {
		const user =
			req.authUser || (await models.users.findByPk(req.auth.sub));
		if (!user) {
			return res.status(404).json({ message: "Utilisateur introuvable" });
		}
		return res.json({ user: pickUser(user) });
	});

	router.get("/auth/sessions", auth, async (req, res) => {
		const user =
			req.authUser || (await models.users.findByPk(req.auth.sub));
		if (!user) {
			return res.status(404).json({ message: "Utilisateur introuvable" });
		}

		const sessions = await models.audit_logs.findAll({
			where: {
				actorId: user.id,
				actionType: { [Op.in]: ["LOGIN", "LOGOUT"] },
			},
			order: [["createdAt", "DESC"]],
			limit: 12,
		});

		return res.json({
			currentSession: {
				issuedAt: req.auth.iat ? new Date(req.auth.iat * 1000) : null,
				expiresAt: req.auth.exp ? new Date(req.auth.exp * 1000) : null,
				sessionVersion: Number(user.sessionVersion || 0),
			},
			sessions: sessions.map((session) => ({
				id: session.id,
				type: session.actionType,
				createdAt: session.createdAt,
				actorEmail: session.actorEmail,
				metadata: session.metadata,
			})),
		});
	});

	router.post("/auth/sessions/revoke-all", auth, async (req, res) => {
		const user =
			req.authUser || (await models.users.findByPk(req.auth.sub));
		if (!user) {
			return res.status(404).json({ message: "Utilisateur introuvable" });
		}

		await user.increment("sessionVersion", { by: 1 });
		await writeAuditLog(app, {
			actorId: user.id,
			actorEmail: user.email,
			actionType: "SESSION_REVOKE_ALL",
			resourceType: "auth",
			resourceId: user.id,
		});

		return res.status(204).send();
	});

	router.patch("/auth/me", auth, async (req, res) => {
		const user =
			req.authUser || (await models.users.findByPk(req.auth.sub));
		if (!user) {
			return res.status(404).json({ message: "Utilisateur introuvable" });
		}

		const payload = {};
		if (req.body.email) payload.email = req.body.email;
		if (req.body.name) payload.name = req.body.name;
		if (req.body.firstName) payload.firstName = req.body.firstName;
		if (req.body.lastName) payload.lastName = req.body.lastName;
		if (Object.prototype.hasOwnProperty.call(req.body, "avatarUrl"))
			payload.avatarUrl = req.body.avatarUrl;
		if (req.body.password) {
			payload.passwordHash = await bcrypt.hash(req.body.password, 10);
			payload.mustChangePassword = false;
		}

		await user.update(payload);
		await writeAuditLog(app, {
			actorId: user.id,
			actorEmail: user.email,
			actionType: "PROFILE_UPDATE",
			resourceType: "user",
			resourceId: user.id,
			metadata: {
				changed: Object.keys(payload),
			},
		});
		return res.json({ user: pickUser(user) });
	});

	router.get(
		"/users",
		auth,
		requireRole("responsable"),
		async (_req, res) => {
			const users = await models.users.findAll({
				include: [{ model: models.organizations, as: "organization" }],
				order: [["createdAt", "DESC"]],
			});
			return res.json({
				users: users.map((user) => ({
					...pickUser(user),
					firstName: user.firstName,
					lastName: user.lastName,
					avatarUrl: user.avatarUrl,
					organizationId: user.organizationId,
					organization: user.organization,
				})),
			});
		},
	);

	router.post(
		"/users",
		auth,
		requireRole("responsable"),
		async (req, res) => {
			// Input parse
			const {
				email,
				name,
				firstName,
				lastName,
				password,
				role,
				organizationId,
				avatarUrl,
			} = req.body;
			if (!email || !name || !firstName || !lastName) {
				return res
					.status(400)
					.json({ message: "Champs requis manquants" });
			}
			const exists = await models.users.findOne({ where: { email } });
			if (exists)
				return res
					.status(409)
					.json({ message: "Utilisateur deja existant" });
			const rawPassword = password || DEFAULT_CREATED_USER_PASSWORD;
			const mustChangePassword = !password;
			const normalizedRole = normalizeInputRole(role || "membre");
			if (!ALLOWED_ROLES.includes(normalizedRole)) {
				return res.status(400).json({ message: "Role invalide" });
			}
			if (!canCreateTargetRole(req.auth?.role, normalizedRole)) {
				return res.status(403).json({
					message: "Un responsable ne peut creer que des referents.",
				});
			}

			const user = await models.users.create({
				email,
				name,
				firstName,
				lastName,
				avatarUrl: avatarUrl || null,
				organizationId: organizationId || null,
				passwordHash: await bcrypt.hash(rawPassword, 10),
				mustChangePassword,
				role: toDbRole(normalizedRole),
			});
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "USER_CREATE",
				resourceType: "user",
				resourceId: user.id,
				metadata: {
					email: user.email,
					role: user.role,
					mustChangePassword,
				},
			});
			return res.status(201).json({ user: pickUser(user) });
		},
	);

	router.patch(
		"/users/:id",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const user = await models.users.findByPk(req.params.id);
			if (!user)
				return res
					.status(404)
					.json({ message: "Utilisateur introuvable" });

			const payload = {};
			if (req.body.email) payload.email = req.body.email;
			if (req.body.name) payload.name = req.body.name;
			if (req.body.firstName) payload.firstName = req.body.firstName;
			if (req.body.lastName) payload.lastName = req.body.lastName;
			if (req.body.role) {
				const normalizedRole = normalizeInputRole(req.body.role);
				if (!ALLOWED_ROLES.includes(normalizedRole)) {
					return res.status(400).json({ message: "Role invalide" });
				}
				payload.role = toDbRole(normalizedRole);
			}
			if (req.body.organizationId !== undefined)
				payload.organizationId = req.body.organizationId;
			if (Object.prototype.hasOwnProperty.call(req.body, "avatarUrl"))
				payload.avatarUrl = req.body.avatarUrl;
			if (Object.prototype.hasOwnProperty.call(req.body, "isActive")) {
				payload.isActive = Boolean(req.body.isActive);
			}
			if (req.body.password) {
				payload.passwordHash = await bcrypt.hash(req.body.password, 10);
				if (
					Object.prototype.hasOwnProperty.call(
						req.body,
						"mustChangePassword",
					)
				) {
					payload.mustChangePassword = Boolean(
						req.body.mustChangePassword,
					);
				}
			}

			await user.update(payload);
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "USER_UPDATE",
				resourceType: "user",
				resourceId: user.id,
				metadata: {
					changed: Object.keys(payload),
				},
			});
			return res.json({ user: pickUser(user) });
		},
	);

	router.delete(
		"/users/:id",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const deleted = await models.users.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res
					.status(404)
					.json({ message: "Utilisateur introuvable" });
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "USER_DELETE",
				resourceType: "user",
				resourceId: req.params.id,
			});
			return res.status(204).send();
		},
	);

	router.get(
		"/admin/logs",
		auth,
		requireRole("responsable"),
		async (req, res) => {
			const where = {};
			if (req.query.kind === "connection") {
				where.actionType = { [Op.in]: ["LOGIN", "LOGOUT"] };
			}
			if (req.query.kind === "modification") {
				where.actionType = {
					[Op.notIn]: ["LOGIN", "LOGOUT"],
				};
			}

			const logs = await models.audit_logs.findAll({
				where,
				order: [["createdAt", "DESC"]],
				limit: Number(req.query.limit || 100),
			});
			return res.json({ logs });
		},
	);

	router.post("/pims", auth, requireRole("responsable"), async (req, res) => {
		const pim = await models.pims.create(req.body);
		await models.pages.bulkCreate(
			defaultPimPages().map((page) => ({ ...page, pimId: pim.id })),
		);
		await writeAuditLog(app, {
			actorId: req.auth.sub,
			actorEmail: req.auth.email,
			actionType: "PIM_CREATE",
			resourceType: "pim",
			resourceId: pim.id,
			metadata: { title: pim.title, code: pim.code },
		});
		return res.status(201).json({ pim });
	});

	router.get("/pims", auth, async (_req, res) => {
		const pims = await models.pims.findAll({
			order: [["createdAt", "DESC"]],
		});
		return res.json({ pims });
	});

	router.get("/pims/:id", auth, async (req, res) => {
		const pim = await models.pims.findByPk(req.params.id);
		if (!pim) return res.status(404).json({ message: "PIM introuvable" });
		return res.json({ pim });
	});

	router.patch(
		"/pims/:id",
		auth,
		requireRole("responsable"),
		async (req, res) => {
			const pim = await models.pims.findByPk(req.params.id);
			if (!pim)
				return res.status(404).json({ message: "PIM introuvable" });
			await pim.update(req.body);
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "PIM_UPDATE",
				resourceType: "pim",
				resourceId: pim.id,
				metadata: { changed: Object.keys(req.body || {}) },
			});
			return res.json({ pim });
		},
	);

	router.delete(
		"/pims/:id",
		auth,
		requireRole("super_admin"),
		async (req, res) => {
			const deleted = await models.pims.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res.status(404).json({ message: "PIM introuvable" });
			await writeAuditLog(app, {
				actorId: req.auth.sub,
				actorEmail: req.auth.email,
				actionType: "PIM_DELETE",
				resourceType: "pim",
				resourceId: req.params.id,
			});
			return res.status(204).send();
		},
	);

	router.post(
		"/pims/:id/seed-defaults",
		auth,
		requireRole("responsable"),
		async (req, res) => {
			// Seed defaults
			const { pim } = await seedPimDefaults(models, req.params.id);
			if (!pim)
				return res.status(404).json({ message: "PIM introuvable" });

			return res.status(201).json({ message: "Templates PIM ajoutes" });
		},
	);

	router.get("/juniors", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const juniors = await models.juniors.findAll({
			where,
			include: [
				{
					model: models.users,
					as: "referent",
					attributes: ["id", "name", "email", "role"],
				},
			],
			order: [["createdAt", "DESC"]],
		});
		return res.json({ juniors });
	});

	router.post("/juniors", auth, requireRole("referent"), async (req, res) => {
		const payload = { ...juniorTemplate(req.body.template), ...req.body };
		delete payload.template;
		if (!payload.displayName && payload.firstName && payload.lastName) {
			payload.displayName = `${payload.firstName} ${payload.lastName}`;
		}
		const junior = await models.juniors.create(payload);
		return res.status(201).json({ junior });
	});

	router.patch(
		"/juniors/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const junior = await models.juniors.findByPk(req.params.id);
			if (!junior)
				return res.status(404).json({ message: "Junior introuvable" });
			await junior.update(req.body);
			return res.json({ junior });
		},
	);

	router.delete(
		"/juniors/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.juniors.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res.status(404).json({ message: "Junior introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/feed-events", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const events = await models.feed_events.findAll({
			where,
			include: [
				{
					model: models.users,
					as: "responsable",
					attributes: ["id", "name", "email", "role"],
				},
				{
					model: models.juniors,
					as: "juniors",
					through: { attributes: [] },
					attributes: ["id", "displayName"],
				},
			],
			order: [["startAt", "ASC"]],
		});

		return res.json({ events });
	});

	router.post(
		"/feed-events",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const { juniorIds = [], ...eventData } = req.body;
			const timelineSource = resolveTimelineSource(
				eventData.timelineSource,
				req.auth.role,
			);
			const event = await models.feed_events.create({
				...eventData,
				timelineSource,
				responsableId: eventData.responsableId || req.auth.sub,
			});

			if (juniorIds.length) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await event.setJuniors(juniors);
			}

			await app.redis.publish(app.config.database.synchronize.event, {
				table: "feed_events",
				type: "insert",
				id: event.id,
				data: event,
			});

			const hydrated = await models.feed_events.findByPk(event.id, {
				include: [
					{
						model: models.juniors,
						as: "juniors",
						through: { attributes: [] },
						attributes: ["id", "displayName"],
					},
				],
			});

			return res.status(201).json({ event: hydrated });
		},
	);

	router.patch(
		"/feed-events/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const event = await models.feed_events.findByPk(req.params.id);
			if (!event)
				return res
					.status(404)
					.json({ message: "Evenement introuvable" });

			const { juniorIds, ...payload } = req.body;
			await event.update(payload);

			if (Array.isArray(juniorIds)) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await event.setJuniors(juniors);
			}

			return res.json({ event });
		},
	);

	router.delete(
		"/feed-events/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.feed_events.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res
					.status(404)
					.json({ message: "Evenement introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/notes", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const notes = await models.notes.findAll({
			where,
			include: [
				{
					model: models.juniors,
					as: "juniors",
					through: { attributes: [] },
					attributes: ["id", "displayName"],
				},
			],
			order: [["createdAt", "DESC"]],
		});
		return res.json({ notes });
	});

	router.post("/notes", auth, requireRole("referent"), async (req, res) => {
		const { juniorIds = [], ...payload } = req.body;
		const note = await models.notes.create({
			...payload,
			authorId: req.auth.sub,
		});
		if (juniorIds.length) {
			const juniors = await models.juniors.findAll({
				where: { id: juniorIds },
			});
			await note.setJuniors(juniors);
		}
		return res.status(201).json({ note });
	});

	router.patch(
		"/notes/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const note = await models.notes.findByPk(req.params.id);
			if (!note)
				return res.status(404).json({ message: "Note introuvable" });
			const { juniorIds, ...payload } = req.body;
			await note.update(payload);
			if (Array.isArray(juniorIds)) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await note.setJuniors(juniors);
			}
			return res.json({ note });
		},
	);

	router.delete(
		"/notes/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.notes.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res.status(404).json({ message: "Note introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/remarks", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const remarks = await models.remarks.findAll({
			where,
			include: [
				{
					model: models.juniors,
					as: "juniors",
					through: { attributes: [] },
					attributes: ["id", "displayName"],
				},
			],
			order: [["createdAt", "DESC"]],
		});
		return res.json({ remarks });
	});

	router.post("/remarks", auth, requireRole("referent"), async (req, res) => {
		const { juniorIds = [], ...payload } = req.body;
		const remark = await models.remarks.create({
			...payload,
			authorId: req.auth.sub,
		});
		if (juniorIds.length) {
			const juniors = await models.juniors.findAll({
				where: { id: juniorIds },
			});
			await remark.setJuniors(juniors);
		}
		return res.status(201).json({ remark });
	});

	router.patch(
		"/remarks/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const remark = await models.remarks.findByPk(req.params.id);
			if (!remark)
				return res
					.status(404)
					.json({ message: "Remarque introuvable" });
			const { juniorIds, ...payload } = req.body;
			await remark.update(payload);
			if (Array.isArray(juniorIds)) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await remark.setJuniors(juniors);
			}
			return res.json({ remark });
		},
	);

	router.delete(
		"/remarks/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.remarks.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res
					.status(404)
					.json({ message: "Remarque introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/trainings", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const trainings = await models.trainings.findAll({
			where,
			order: [["createdAt", "DESC"]],
		});
		return res.json({ trainings });
	});

	router.post(
		"/trainings",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const training = await models.trainings.create(req.body);
			return res.status(201).json({ training });
		},
	);

	router.patch(
		"/trainings/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const training = await models.trainings.findByPk(req.params.id);
			if (!training)
				return res
					.status(404)
					.json({ message: "Formation introuvable" });
			await training.update(req.body);
			return res.json({ training });
		},
	);

	router.delete(
		"/trainings/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.trainings.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res
					.status(404)
					.json({ message: "Formation introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/workshops", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const workshops = await models.workshops.findAll({
			where,
			order: [["createdAt", "DESC"]],
		});
		return res.json({ workshops });
	});

	router.post(
		"/workshops",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const { juniorIds = [], ...payload } = req.body;
			const workshop = await models.workshops.create({
				...payload,
				responsableId: req.auth.sub,
			});
			if (juniorIds.length) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await workshop.setJuniors(juniors);
			}
			return res.status(201).json({ workshop });
		},
	);

	router.patch(
		"/workshops/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const workshop = await models.workshops.findByPk(req.params.id);
			if (!workshop)
				return res.status(404).json({ message: "Atelier introuvable" });
			const { juniorIds, ...payload } = req.body;
			await workshop.update(payload);
			if (Array.isArray(juniorIds)) {
				const juniors = await models.juniors.findAll({
					where: { id: juniorIds },
				});
				await workshop.setJuniors(juniors);
			}
			return res.json({ workshop });
		},
	);

	router.delete(
		"/workshops/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.workshops.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res.status(404).json({ message: "Atelier introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/pages", auth, async (req, res) => {
		const where = req.query.pimId ? { pimId: req.query.pimId } : undefined;
		const pages = await models.pages.findAll({
			where,
			order: [["position", "ASC"]],
		});
		return res.json({ pages });
	});

	router.post("/pages", auth, requireRole("referent"), async (req, res) => {
		const page = await models.pages.create(req.body);
		return res.status(201).json({ page });
	});

	router.patch(
		"/pages/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const page = await models.pages.findByPk(req.params.id);
			if (!page)
				return res.status(404).json({ message: "Page introuvable" });
			await page.update(req.body);
			return res.json({ page });
		},
	);

	router.delete(
		"/pages/:id",
		auth,
		requireRole("referent"),
		async (req, res) => {
			const deleted = await models.pages.destroy({
				where: { id: req.params.id },
			});
			if (!deleted)
				return res.status(404).json({ message: "Page introuvable" });
			return res.status(204).send();
		},
	);

	router.get("/activity", auth, async (_req, res) => {
		const [recentJuniors, recentEvents, recentPims] = await Promise.all([
			models.juniors.findAll({
				order: [["createdAt", "DESC"]],
				limit: 10,
				attributes: ["id", "displayName", "pimId", "createdAt"],
			}),
			models.feed_events.findAll({
				order: [["createdAt", "DESC"]],
				limit: 10,
				attributes: ["id", "title", "eventType", "pimId", "createdAt"],
			}),
			models.pims.findAll({
				order: [["createdAt", "DESC"]],
				limit: 5,
				attributes: ["id", "title", "code", "type", "createdAt"],
			}),
		]);

		const activities = [
			...recentJuniors.map((j) => ({
				type: "junior_create",
				label: `Nouveau junior : ${j.displayName}`,
				pimId: j.pimId,
				createdAt: j.createdAt,
			})),
			...recentEvents.map((e) => ({
				type: "event_create",
				label: `Nouvel evenement : ${e.title}`,
				meta: e.eventType,
				pimId: e.pimId,
				createdAt: e.createdAt,
			})),
			...recentPims.map((p) => ({
				type: "pim_create",
				label: `Nouvelle session : ${p.title}`,
				meta: p.type || p.code,
				pimId: p.id,
				createdAt: p.createdAt,
			})),
		]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 20);

		return res.json({ activities });
	});

	router.use((error, _req, res, _next) => {
		app.logger.error(error);
		return res
			.status(500)
			.json({ message: "Erreur interne", details: error.message });
	});

	return router;
};
