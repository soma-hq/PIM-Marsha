import React, { useEffect, useMemo, useState } from "react";

import {
	createUser,
	fetchAdminLogs,
	updateUserAdmin,
} from "../utils/api/client.jsx";
import { FancySelect } from "../components/ui/Controls.jsx";

/**
 * Renders One Audit Log Item
 * @param {{ log: any }} props Item Props
 * @returns {JSX.Element} Item View
 */

function LogItem({ log }) {
	const isConnection = ["LOGIN", "LOGOUT"].includes(log.actionType);
	return (
		<div
			className={`rounded-md border px-4 py-3 text-sm ${isConnection ? "border-cyan-400/20 bg-cyan-500/5" : "border-white/10 bg-black/35"}`}>
			<div className="flex items-center justify-between gap-3">
				<p className="font-semibold text-white">{log.actionType}</p>
				<p className="text-xs text-white/45">
					{new Date(log.createdAt).toLocaleString("fr-FR")}
				</p>
			</div>
			<p className="text-xs text-white/60">
				{log.actorEmail || "Système"}
			</p>
		</div>
	);
}

/**
 * Renders Admin Page
 * @param {{ users: any[], onUserCreated: (user: any) => void, user: any }} props Page Props
 * @returns {JSX.Element} Page View
 */

export function AdminPage({ users, onUserCreated, user }) {
	// Panel state
	const [panel, setPanel] = useState("create");
	const [logKind, setLogKind] = useState("all");
	const [logs, setLogs] = useState([]);
	const [status, setStatus] = useState("");
	const [updatingUserId, setUpdatingUserId] = useState("");
	const [form, setForm] = useState({
		email: "",
		name: "",
		firstName: "",
		lastName: "",
		role: "referent",
	});
	const isResponsable =
		String(user?.role || "").toLowerCase() === "responsable";
	const isSuperAdmin =
		String(user?.role || "").toLowerCase() === "super_admin";
	const roleOptions = isResponsable
		? [{ value: "referent", label: "Référent" }]
		: [
				{ value: "membre", label: "Membre" },
				{ value: "referent", label: "Référent" },
				{ value: "responsable", label: "Responsable" },
				{ value: "super_admin", label: "Super admin" },
			];

	const activeUsersCount = useMemo(
		() => users.filter((item) => item.isActive !== false).length,
		[users],
	);

	useEffect(() => {
		// Initial logs
		loadLogs("all");
	}, []);

	/**
	 * Loads Audit Logs
	 * @param {"all"|"connection"|"modification"} kind Log Filter
	 * @returns {Promise<void>} Async Done
	 */

	async function loadLogs(kind) {
		setLogKind(kind);
		setStatus("Chargement des logs...");
		try {
			const response = await fetchAdminLogs(kind);
			setLogs(response.logs || []);
			setStatus("");
		} catch (error) {
			setStatus(error.message || "Impossible de charger les logs.");
		}
	}

	/**
	 * Creates New User
	 * @param {React.FormEvent<HTMLFormElement>} event Submit Event
	 * @returns {Promise<void>} Async Done
	 */

	async function submitUser(event) {
		// Create user
		event.preventDefault();
		setStatus("Création de l'utilisateur...");
		try {
			const response = await createUser(form);
			onUserCreated(response.user);
			setStatus(
				"Utilisateur créé. Mot de passe par défaut: ChangeMe123!",
			);
			setForm({
				email: "",
				name: "",
				firstName: "",
				lastName: "",
				role: "referent",
			});
		} catch (error) {
			setStatus(error.message || "Impossible de créer l'utilisateur.");
		}
	}

	/**
	 * Toggles User Active State
	 * @param {any} targetUser Target User
	 * @returns {Promise<void>} Async Done
	 */

	async function toggleActive(targetUser) {
		// Toggle lock
		setUpdatingUserId(targetUser.id);
		setStatus("Mise à jour du statut utilisateur...");
		try {
			const response = await updateUserAdmin(targetUser.id, {
				isActive: !(targetUser.isActive !== false),
			});
			onUserCreated(response.user);
			setStatus("Statut utilisateur mis à jour.");
		} catch (error) {
			setStatus(
				error.message || "Impossible de mettre à jour le statut.",
			);
		} finally {
			setUpdatingUserId("");
		}
	}

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.22em] text-white/35">
						Admin
					</p>
					<h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
						Gestion des accès
					</h2>
				</div>
				<div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
					{activeUsersCount}/{users.length} utilisateurs actifs
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				{[
					{ key: "create", label: "Créer" },
					{ key: "logs", label: "Logs" },
					{ key: "users", label: "Utilisateurs" },
				].map((item) => (
					<button
						key={item.key}
						type="button"
						onClick={() => setPanel(item.key)}
						className={`rounded-md border px-4 py-2 text-sm transition ${panel === item.key ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"}`}>
						{item.label}
					</button>
				))}
			</div>

			{panel === "create" ? (
				<div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
					<h3 className="mb-4 text-lg font-semibold">
						Ajouter un utilisateur
					</h3>
					<form className="grid gap-3" onSubmit={submitUser}>
						<input
							value={form.email}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									email: event.target.value,
								}))
							}
							type="email"
							required
							placeholder="Email"
							className="h-11 rounded-md border border-white/10 bg-black/50 px-3"
						/>
						<input
							value={form.name}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									name: event.target.value,
								}))
							}
							required
							placeholder="Nom d'affichage"
							className="h-11 rounded-md border border-white/10 bg-black/50 px-3"
						/>
						<div className="grid gap-3 sm:grid-cols-2">
							<input
								value={form.firstName}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										firstName: event.target.value,
									}))
								}
								required
								placeholder="Prénom"
								className="h-11 rounded-md border border-white/10 bg-black/50 px-3"
							/>
							<input
								value={form.lastName}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										lastName: event.target.value,
									}))
								}
								required
								placeholder="Nom"
								className="h-11 rounded-md border border-white/10 bg-black/50 px-3"
							/>
						</div>
						<FancySelect
							label="Rôle"
							value={form.role}
							options={roleOptions}
							onChange={(value) =>
								setForm((prev) => ({
									...prev,
									role: value,
								}))
							}
						/>
						<button
							type="submit"
							className="h-12 rounded-md bg-white text-sm font-semibold text-black">
							Ajouter
						</button>
						{status ? (
							<p className="mt-2 text-sm text-white/70">
								{status}
							</p>
						) : null}
					</form>
				</div>
			) : null}

			{panel === "logs" ? (
				<div className="space-y-4 rounded-md border border-white/10 bg-white/[0.03] p-4">
					<div className="flex flex-wrap gap-2">
						{[
							{ key: "all", label: "Tous" },
							{ key: "connection", label: "Connexions" },
							{ key: "modification", label: "Modifications" },
						].map((item) => (
							<button
								key={item.key}
								type="button"
								onClick={() => loadLogs(item.key)}
								className={`rounded-md border px-4 py-2 text-xs ${logKind === item.key ? "border-white/20 bg-white text-black" : "border-white/20 text-white/80 hover:bg-white/5"}`}>
								{item.label}
							</button>
						))}
					</div>
					<div className="max-h-[30rem] space-y-2 overflow-auto pr-1">
						{logs.map((log) => (
							<LogItem key={log.id} log={log} />
						))}
						{logs.length === 0 ? (
							<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">
								Aucun log disponible.
							</p>
						) : null}
					</div>
					{status ? (
						<p className="text-sm text-white/70">{status}</p>
					) : null}
				</div>
			) : null}

			{panel === "users" ? (
				<div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-white/10 text-left text-sm">
							<thead className="bg-white/[0.04] text-white/70">
								<tr>
									<th className="px-4 py-3">Nom</th>
									<th className="hidden px-4 py-3 sm:table-cell">
										Email
									</th>
									<th className="px-4 py-3">Rôle</th>
									<th className="px-4 py-3">Statut</th>
									<th className="hidden px-4 py-3 md:table-cell">
										Sécurité
									</th>
									{isSuperAdmin ? (
										<th className="px-4 py-3">Action</th>
									) : null}
								</tr>
							</thead>
							<tbody className="divide-y divide-white/10 bg-black/40">
								{users.map((currentUser) => {
									const isActive =
										currentUser.isActive !== false;
									return (
										<tr key={currentUser.id}>
											<td className="px-4 py-3">
												{currentUser.name}
											</td>
											<td className="hidden px-4 py-3 text-white/70 sm:table-cell">
												{currentUser.email}
											</td>
											<td className="px-4 py-3">
												{String(
													currentUser.role || "",
												).toLowerCase()}
											</td>
											<td className="px-4 py-3">
												<span
													className={`rounded-md border px-2 py-1 text-xs font-semibold ${isActive ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200"}`}>
													{isActive
														? "Actif"
														: "Inactif"}
												</span>
											</td>
											<td className="hidden px-4 py-3 text-xs text-white/70 md:table-cell">
												{currentUser.mustChangePassword
													? "Doit changer son mot de passe"
													: "Profil standard"}
											</td>
											{isSuperAdmin ? (
												<td className="px-4 py-3">
													<button
														type="button"
														disabled={
															updatingUserId ===
															currentUser.id
														}
														onClick={() =>
															toggleActive(
																currentUser,
															)
														}
														className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 disabled:opacity-60">
														{isActive
															? "Désactiver"
															: "Activer"}
													</button>
												</td>
											) : null}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					{status ? (
						<p className="p-4 text-sm text-white/70">{status}</p>
					) : null}
				</div>
			) : null}
		</section>
	);
}
