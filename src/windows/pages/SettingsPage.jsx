import React, { useEffect, useRef, useState } from "react";

import { updateMe, revokeAllMySessions, updatePrefs } from "../utils/api/client.jsx";

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

const TABS = [
	{ id: "profile", label: "Profil" },
	{ id: "security", label: "Sécurité" },
	{ id: "preferences", label: "Préférences" },
	{ id: "logs", label: "Logs personnelles" },
];

const LOGO_KEYS = [
	{ key: "michou.png", label: "Michou" },
	{ key: "doigby.png", label: "Doigby" },
	{ key: "inoxtag.png", label: "Inoxtag" },
];

/**
 * Renders Settings Page
 * @param {{ user: any, sessionsPayload: any, prefs: any, onUserUpdated: (user: any) => void, onPrefsUpdated: (prefs: any) => void, onSecurityChanged?: () => void }} props
 * @returns {JSX.Element} Page View
 */

export function SettingsPage({
	user,
	sessionsPayload,
	prefs,
	onUserUpdated,
	onPrefsUpdated,
	onSecurityChanged,
}) {
	const [activeTab, setActiveTab] = useState("profile");

	// Profile state
	const [form, setForm] = useState({
		name: user?.name || "",
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		avatarUrl: user?.avatarUrl || "",
	});
	const [profileStatus, setProfileStatus] = useState("");
	const [busy, setBusy] = useState(false);
	const avatarInputRef = useRef(null);

	// Security state
	const [sessions, setSessions] = useState(sessionsPayload?.sessions || []);
	const [currentSession, setCurrentSession] = useState(sessionsPayload?.currentSession || null);
	const [securityStatus, setSecurityStatus] = useState("");

	// Preferences state
	const [prefForm, setPrefForm] = useState({
		toastDurationMs: prefs?.toastDurationMs ?? 4000,
		logoScales: prefs?.logoScales ?? {},
	});
	const [prefStatus, setPrefStatus] = useState("");

	useEffect(() => {
		setForm({
			name: user?.name || "",
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			avatarUrl: user?.avatarUrl || "",
		});
	}, [user]);

	useEffect(() => {
		setSessions(sessionsPayload?.sessions || []);
		setCurrentSession(sessionsPayload?.currentSession || null);
	}, [sessionsPayload]);

	useEffect(() => {
		setPrefForm({
			toastDurationMs: prefs?.toastDurationMs ?? 4000,
			logoScales: prefs?.logoScales ?? {},
		});
	}, [prefs]);

	async function saveProfile(event) {
		event.preventDefault();
		setBusy(true);
		setProfileStatus("Enregistrement du profil...");
		try {
			const response = await updateMe({
				name: form.name,
				firstName: form.firstName,
				lastName: form.lastName,
				avatarUrl: form.avatarUrl || null,
			});
			onUserUpdated(response.user);
			setProfileStatus("Profil mis à jour.");
		} catch (error) {
			setProfileStatus(error.message || "Impossible de mettre à jour le profil.");
		} finally {
			setBusy(false);
		}
	}

	function handleAvatarFileChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setProfileStatus("Le fichier doit être au format PNG ou JPEG.");
			return;
		}
		if (file.size > 1024 * 1024) {
			setProfileStatus("Le fichier dépasse 1 Mo.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setForm((prev) => ({ ...prev, avatarUrl: String(reader.result || "") }));
		};
		reader.onerror = () => {
			setProfileStatus("Impossible de lire l'image.");
		};
		reader.readAsDataURL(file);
	}

	async function revokeAll() {
		setBusy(true);
		setSecurityStatus("Déconnexion de toutes les sessions...");
		try {
			await revokeAllMySessions();
			setSessions([]);
			setCurrentSession(null);
			setSecurityStatus("Toutes les sessions ont été coupées.");
			onSecurityChanged?.();
		} catch (error) {
			setSecurityStatus(error.message || "Impossible de couper les sessions.");
		} finally {
			setBusy(false);
		}
	}

	async function savePrefs() {
		setBusy(true);
		setPrefStatus("Enregistrement...");
		try {
			const res = await updatePrefs(prefForm);
			onPrefsUpdated?.(res.prefs);
			setPrefStatus("Préférences sauvegardées.");
		} catch (error) {
			setPrefStatus(error.message || "Impossible de sauvegarder.");
		} finally {
			setBusy(false);
		}
	}

	function setLogoScale(key, value) {
		setPrefForm((prev) => ({
			...prev,
			logoScales: { ...prev.logoScales, [key]: value },
		}));
	}

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-4xl space-y-5">
				<div className="overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
					{/* Header */}
					<div className="border-b border-white/10 px-5 py-4">
						<p className="text-xs uppercase tracking-[0.22em] text-white/35">
							Paramètres
						</p>
						<h2 className="mt-2 text-2xl font-semibold">
							{TABS.find((t) => t.id === activeTab)?.label}
						</h2>
					</div>

					{/* Tab Navigation */}
					<div className="flex border-b border-white/10">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`px-5 py-3 text-sm font-medium transition-colors ${
									activeTab === tab.id
										? "border-b-2 border-white/70 text-white"
										: "text-white/40 hover:text-white/70"
								}`}>
								{tab.label}
							</button>
						))}
					</div>

					{/* Profile Tab */}
					{activeTab === "profile" && (
						<form onSubmit={saveProfile} className="space-y-5 px-5 py-6">
							<input ref={avatarInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarFileChange} />

							{form.avatarUrl && (
								<div className="flex justify-center">
									<img
										src={form.avatarUrl}
										alt="Avatar"
										className="h-20 w-20 rounded-full border border-white/10 object-cover"
									/>
								</div>
							)}

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-1.5 block text-xs text-white/50">Prénom</label>
									<input
										type="text"
										value={form.firstName}
										onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
										className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
										placeholder="Prénom"
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-xs text-white/50">Nom</label>
									<input
										type="text"
										value={form.lastName}
										onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
										className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
										placeholder="Nom"
									/>
								</div>
							</div>

							<div>
								<label className="mb-1.5 block text-xs text-white/50">Nom affiché</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
									className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
									placeholder="Nom affiché"
								/>
							</div>

							<div>
								<label className="mb-1.5 block text-xs text-white/50">URL Avatar</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={form.avatarUrl}
										onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
										className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
										placeholder="https://..."
									/>
									<button
										type="button"
										onClick={() => avatarInputRef.current?.click()}
										className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10">
										Choisir
									</button>
								</div>
							</div>

							{profileStatus && (
								<p className="text-xs text-white/50">{profileStatus}</p>
							)}

							<button
								type="submit"
								disabled={busy}
								className="w-full rounded-md border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/12 disabled:opacity-60">
								Enregistrer le profil
							</button>
						</form>
					)}

					{/* Security Tab */}
					{activeTab === "security" && (
						<div className="space-y-5 px-5 py-6">
							<div className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-4">
								<p className="mb-1 text-sm font-semibold text-white">Session courante</p>
								{currentSession ? (
									<>
										<p className="text-xs text-white/50">
											{currentSession.actorEmail || "—"}
										</p>
										<p className="mt-1 text-xs text-white/35">
											{currentSession.metadata?.userAgent || "Agent inconnu"}
										</p>
									</>
								) : (
									<p className="text-xs text-white/35">Aucune session courante.</p>
								)}
							</div>

							{securityStatus && (
								<p className="text-xs text-white/50">{securityStatus}</p>
							)}

							<button
								disabled={busy}
								type="button"
								onClick={revokeAll}
								className="w-full rounded-md border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 disabled:opacity-60">
								Déconnecter toutes les sessions
							</button>
						</div>
					)}

					{/* Preferences Tab */}
					{activeTab === "preferences" && (
						<div className="space-y-6 px-5 py-6">
							<div>
								<label className="mb-1.5 block text-sm font-medium text-white/80">
									Durée des notifications
								</label>
								<p className="mb-3 text-xs text-white/40">
									Durée d'affichage des toasts (en millisecondes). Valeur par défaut : 4000 ms.
								</p>
								<div className="flex items-center gap-4">
									<input
										type="range"
										min={1000}
										max={10000}
										step={500}
										value={prefForm.toastDurationMs}
										onChange={(e) => setPrefForm((prev) => ({ ...prev, toastDurationMs: Number(e.target.value) }))}
										className="flex-1 accent-white/70"
									/>
									<span className="w-20 text-right text-sm text-white/60">
										{prefForm.toastDurationMs} ms
									</span>
								</div>
							</div>

							<div>
								<label className="mb-1.5 block text-sm font-medium text-white/80">
									Taille des logos
								</label>
								<p className="mb-3 text-xs text-white/40">
									Ajustez la taille des logos par organisation (multiplicateur).
								</p>
								<div className="space-y-4">
									{LOGO_KEYS.map(({ key, label }) => {
										const scale = prefForm.logoScales[key] ?? 1;
										return (
											<div key={key} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.02] px-4 py-3">
												<span className="w-24 text-sm text-white/70">{label}</span>
												<input
													type="range"
													min={0.3}
													max={2.5}
													step={0.05}
													value={scale}
													onChange={(e) => setLogoScale(key, Number(e.target.value))}
													className="flex-1 accent-white/70"
												/>
												<span className="w-12 text-right text-sm text-white/60">
													×{scale.toFixed(2)}
												</span>
											</div>
										);
									})}
								</div>
							</div>

							{prefStatus && (
								<p className="text-xs text-white/50">{prefStatus}</p>
							)}

							<button
								type="button"
								disabled={busy}
								onClick={savePrefs}
								className="w-full rounded-md border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/12 disabled:opacity-60">
								Enregistrer les préférences
							</button>
						</div>
					)}

					{/* Logs personnelles Tab */}
					{activeTab === "logs" && (
						<div className="space-y-4 px-5 py-6">
							<p className="text-xs uppercase tracking-[0.18em] text-white/35">
								Logs personnelles
							</p>
							<div className="space-y-2">
								{sessions.map((session) => (
									<SessionItem key={session.id} session={session} />
								))}
								{sessions.length === 0 ? (
									<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
										Aucune session récente enregistrée.
									</p>
								) : null}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
