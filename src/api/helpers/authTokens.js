const jwt = require("jsonwebtoken");

/**
 * Normalizes Role Value
 * @param {string|null|undefined} role Raw Role
 * @returns {string} Normalized Role
 */

function normalizeRole(role) {
	return String(role || "").toLowerCase();
}

/**
 * Builds Public User Shape
 * @param {any} user User Record
 * @returns {object} Safe User Payload
 */

function pickUser(user) {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		firstName: user.firstName,
		lastName: user.lastName,
		avatarUrl: user.avatarUrl,
		organizationId: user.organizationId,
		role: normalizeRole(user.role),
		mustChangePassword: Boolean(user.mustChangePassword),
		isActive: Boolean(user.isActive ?? true),
		lastLoginAt: user.lastLoginAt,
		sessionVersion: Number(user.sessionVersion || 0),
		createdAt: user.createdAt,
	};
}

/**
 * Signs Session Token
 * @param {any} app App Container
 * @param {any} user User Record
 * @returns {string} Signed Token
 */

function issueToken(app, user) {
	return jwt.sign(
		{
			sub: user.id,
			role: normalizeRole(user.role),
			email: user.email,
			sessionVersion: Number(user.sessionVersion || 0),
		},
		app.config.jwtSecret,
		{ expiresIn: "12h" },
	);
}

/**
 * Sets Session Cookie
 * @param {any} app App Container
 * @param {any} res Express Response
 * @param {string} token Session Token
 * @returns {void} Nothing
 */

function setSessionCookie(app, res, token) {
	res.cookie(app.config.cookie.name, token, {
		httpOnly: app.config.cookie.httpOnly,
		sameSite: app.config.cookie.sameSite,
		secure: app.config.cookie.secure,
		maxAge: app.config.cookie.maxAge,
		path: "/",
	});
}

/**
 * Clears Session Cookie
 * @param {any} app App Container
 * @param {any} res Express Response
 * @returns {void} Nothing
 */

function clearSessionCookie(app, res) {
	res.clearCookie(app.config.cookie.name, { path: "/" });
}

module.exports = {
	pickUser,
	issueToken,
	setSessionCookie,
	clearSessionCookie,
};
