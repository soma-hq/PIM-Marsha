import React, { useEffect, useRef, useState } from "react";

import { updateMe, revokeAllMySessions } from "../utils/api/client.jsx";

/**
 * Renders One Session Row
 * @param {{ session: any }} props Session Props
 * @returns {JSX.Element} Session View
 */

function SessionItem({ session }) {
	const isLogin = session.type === "LOGIN";
	return (
		<div className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-white">
						{isLogin ? "Connexion" : "Déconnexion"}
					</p>
					<p className="text-xs text-white/50">
						{session.actorEmail || "Session"} •{" "}
						{new Date(session.createdAt).toLocaleString("fr-FR")}
					</p>
				</div>
				<span
					className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${isLogin ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-white/50"}`}>
					{session.type}
				</span>
			</div>
			{session.metadata?.userAgent ? (
				<p className="mt-2 break-words text-xs text-white/40">
					{session.metadata.userAgent}
				</p>
			) : null}
		</div>
	);
}

/**
 * Renders Settings Page
 * @param {{ user: any, sessionsPayload: { sessions?: any[], currentSession?: any }|null, onUserUpdated: (user: any) => void, onSecurityChanged?: () => void }} props Page Props
 * @returns {JSX.Element} Page View
 */

export function SettingsPage({
	user,
	sessionsPayload,
	onUserUpdated,
	onSecurityChanged,
}) {
	// Profile state
	const [form, setForm] = useState({
		name: user?.name || "",
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		avatarUrl: user?.avatarUrl || "",
	});
	const [status, setStatus] = useState("");
	const [sessions, setSessions] = useState(sessionsPayload?.sessions || []);
	const [currentSession, setCurrentSession] = useState(
		sessionsPayload?.currentSession || null,
	);
	const [busy, setBusy] = useState(false);
	const avatarInputRef = useRef(null);

	useEffect(() => {
		// User sync
		setForm({
			name: user?.name || "",
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			avatarUrl: user?.avatarUrl || "",
		});
	}, [user]);

	useEffect(() => {
		// Sessions sync
		setSessions(sessionsPayload?.sessions || []);
		setCurrentSession(sessionsPayload?.currentSession || null);
	}, [sessionsPayload]);

	/**
	 * Saves Profile Changes
	 * @param {React.FormEvent<HTMLFormElement>} event Submit Event
	 * @returns {Promise<void>} Async Done
	 */

	async function saveProfile(event) {
		// Profile save
		event.preventDefault();
		setBusy(true);
		setStatus("Enregistrement du profil...");
		try {
			const response = await updateMe({
				name: form.name,
				firstName: form.firstName,
				lastName: form.lastName,
				avatarUrl: form.avatarUrl || null,
			});
			onUserUpdated(response.user);
			setStatus("Profil mis à jour.");
		} catch (error) {
			setStatus(
				error.message || "Impossible de mettre à jour le profil.",
			);
		} finally {
			setBusy(false);
		}
	}

	/**
	 * Handles Avatar Upload
	 * @param {React.ChangeEvent<HTMLInputElement>} event Input Event
	 * @returns {void} Nothing
	 */

	function handleAvatarFileChange(event) {
		// Avatar checks
		const file = event.target.files?.[0];
		if (!file) return;
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setStatus("Le fichier doit être au format PNG ou JPEG.");
			return;
		}
		if (file.size > 1024 * 1024) {
			setStatus("Le fichier dépasse 1 Mo.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setForm((prev) => ({
				...prev,
				avatarUrl: String(reader.result || ""),
			}));
		};
		reader.onerror = () => {
			setStatus("Impossible de lire l'image.");
		};
		reader.readAsDataURL(file);
	}

	/**
	 * Revokes All Sessions
	 * @returns {Promise<void>} Async Done
	 */

	async function revokeAll() {
		// Global logout
		setBusy(true);
		setStatus("Déconnexion de toutes les sessions...");
		try {
			await revokeAllMySessions();
			setSessions([]);
			setCurrentSession(null);
			setStatus("Toutes les sessions ont été coupées.");
			onSecurityChanged?.();
		} catch (error) {
			setStatus(error.message || "Impossible de couper les sessions.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-4xl space-y-5">
				<div className="overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
					<div className="border-b border-white/10 px-5 py-4">
						<p className="text-xs uppercase tracking-[0.22em] text-white/35">
							Paramètres
						</p>
						<h2 className="mt-2 text-2xl font-semibold">
							Mon profil
						</h2>
					</div>
					<form className="grid gap-4 p-5" onSubmit={saveProfile}>
						<div className="flex items-center gap-4 p-1">
							<img
								src={
									form.avatarUrl ||
									user?.avatarUrl ||
									"/logos/michou-logo.png"
								}
								alt={user?.name || "Avatar"}
								className="h-20 w-20 rounded-full object-cover"
								onError={(event) => {
									event.currentTarget.src =
										"/logos/michou-logo.png";
								}}
							/>
							<div className="space-y-2 text-sm text-white/55">
								<button
									type="button"
									onClick={() =>
										avatarInputRef.current?.click()
									}
									className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/5">
									Changer l'avatar
								</button>
								<input
									ref={avatarInputRef}
									type="file"
									accept="image/png,image/jpeg"
									onChange={handleAvatarFileChange}
									className="hidden"
								/>
								<p className="text-xs text-white/45">
									PNG ou JPEG, 1 Mo max.
								</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<label className="space-y-2 text-sm">
								<span className="text-white/70">Nom</span>
								<input
									value={form.name}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											name: event.target.value,
										}))
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
								/>
							</label>
							<label className="space-y-2 text-sm">
								<span className="text-white/70">Pseudo</span>
								<input
									value={user?.name || ""}
									disabled
									className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white/55 outline-none"
								/>
							</label>
							<label className="space-y-2 text-sm">
								<span className="text-white/70">Email</span>
								<input
									value={user?.email || ""}
									disabled
									className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-white/55 outline-none"
								/>
							</label>
							<label className="space-y-2 text-sm">
								<span className="text-white/70">Prénom</span>
								<input
									value={form.firstName}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											firstName: event.target.value,
										}))
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
								/>
							</label>
							<label className="space-y-2 text-sm md:col-span-2">
								<span className="text-white/70">
									Nom de famille
								</span>
								<input
									value={form.lastName}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											lastName: event.target.value,
										}))
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
								/>
							</label>
						</div>

						<div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
							<p className="text-sm text-white/55">{status}</p>
							<button
								disabled={busy}
								type="submit"
								className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">
								Enregistrer
							</button>
						</div>
					</form>
				</div>

				<div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
					<p className="text-xs uppercase tracking-[0.22em] text-white/35">
						Sessions de connexion
					</p>
					<div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 px-4 py-3">
						<div>
							<p className="text-sm font-semibold text-white">
								Session courante
							</p>
							<p className="text-xs text-white/50">
								{currentSession?.issuedAt
									? new Date(
											currentSession.issuedAt,
										).toLocaleString("fr-FR")
									: "Inconnue"}
							</p>
						</div>
						<div className="text-right text-xs text-white/45">
							Version {currentSession?.sessionVersion ?? 0}
						</div>
					</div>
					<div className="mt-4 max-h-[28rem] space-y-2 overflow-auto pr-1">
						{sessions.map((session) => (
							<SessionItem key={session.id} session={session} />
						))}
						{sessions.length === 0 ? (
							<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
								Aucune session récente enregistrée.
							</p>
						) : null}
					</div>
					<button
						disabled={busy}
						type="button"
						onClick={revokeAll}
						className="mt-4 w-full rounded-md border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 disabled:opacity-60">
						Déconnecter toutes les sessions
					</button>
				</div>
			</div>
		</section>
	);
}
