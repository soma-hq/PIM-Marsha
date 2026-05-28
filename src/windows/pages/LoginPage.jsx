import React, { useState } from "react";

import { login } from "../utils/api/client.jsx";

/**
 * Renders Login Page
 * @param {{ onLoginSuccess: (user: any) => void }} props Login Props
 * @returns {JSX.Element} Login View
 */

export function LoginPage({ onLoginSuccess }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState(
		"Connecte-toi pour accéder à la console.",
	);
	const [consoleLogs, setConsoleLogs] = useState([
		{
			level: "info",
			label: "BOOT",
			message: "Console d'accès initialisée.",
			ts: new Date().toLocaleTimeString("fr-FR"),
		},
	]);
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Pushes Console Entry
	 * @param {"info"|"ok"|"error"} level Log Level
	 * @param {string} label Log Label
	 * @param {string} message Log Message
	 * @returns {void} Nothing
	 */

	function pushLog(level, label, message) {
		setConsoleLogs((prev) =>
			[
				{
					level,
					label,
					message,
					ts: new Date().toLocaleTimeString("fr-FR"),
				},
				...prev,
			].slice(0, 8),
		);
	}

	/**
	 * Handles Login Submit
	 * @param {React.FormEvent<HTMLFormElement>} event Submit Event
	 * @returns {Promise<void>} Async Done
	 */

	async function onSubmit(event) {
		event.preventDefault();
		setSubmitting(true);
		setStatus("Connexion en cours...");
		pushLog("info", "AUTH", "Tentative de connexion...");
		try {
			const payload = await login({ email, password });
			pushLog("ok", "AUTH", "Connexion acceptée.");
			onLoginSuccess(payload.user);
			setStatus("Connexion réussie.");
		} catch (error) {
			pushLog(
				"error",
				"AUTH",
				error.message || "Impossible de se connecter.",
			);
			setStatus(error.message || "Impossible de se connecter.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="relative min-h-screen bg-black text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.07),_transparent_45%)]" />
			<div className="relative grid min-h-screen w-full lg:grid-cols-[0.95fr_1fr]">
				<section className="relative hidden items-center justify-start p-4 lg:flex">
					<div className="relative h-full w-full overflow-hidden rounded-lg">
						<img
							src="/assets/banners/inoxtag-banner.png"
							alt="Banniere Inoxtag"
							className="h-full w-full object-cover object-left"
						/>
						<div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/65" />
					</div>
				</section>

				<section className="flex items-center justify-center p-4 sm:p-8 lg:p-10">
					<div className="w-full max-w-2xl p-6 sm:p-10">
						<div className="mb-4 overflow-hidden rounded-md border border-white/10 lg:hidden">
							<img
								src="/assets/banners/inoxtag-banner.png"
								alt="Banniere Inoxtag"
								className="h-28 w-full object-cover object-left"
							/>
						</div>
						<div className="mb-6 flex justify-center">
							<img
								src="/logos/marsha-logo.png"
								alt="Marsha"
								className="h-16 w-auto"
							/>
						</div>
						<h2 className="text-3xl font-bold">Se connecter</h2>

						<form className="mt-8 space-y-4" onSubmit={onSubmit}>
							<label className="block space-y-2 text-sm">
								<span className="text-white/70">Email</span>
								<input
									type="email"
									required
									value={email}
									onChange={(event) =>
										setEmail(event.target.value)
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/60 px-4 text-white outline-none focus:border-white/40"
									placeholder="email@domaine.com"
								/>
							</label>

							<label className="block space-y-2 text-sm">
								<span className="text-white/70">
									Mot de passe
								</span>
								<input
									type="password"
									required
									value={password}
									onChange={(event) =>
										setPassword(event.target.value)
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/60 px-4 text-white outline-none focus:border-white/40"
									placeholder="********"
								/>
							</label>

							<button
								type="submit"
								disabled={submitting}
								className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white/90 disabled:opacity-60">
								{submitting ? (
									<>
										<img
											src="/logos/loader.gif"
											alt="Chargement"
											className="h-5 w-5 rounded-full"
										/>
										Connexion...
									</>
								) : (
									"Connexion"
								)}
							</button>
						</form>

						<div className="mt-4 rounded-md border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/75">
							{status}
						</div>

						<div className="mt-4 rounded-md border border-cyan-400/35 bg-[linear-gradient(160deg,#061224,#070d17)] p-4 shadow-[0_16px_40px_rgba(2,18,40,0.45)]">
							<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
								Console d'accès
							</p>
							<div className="max-h-40 space-y-1 overflow-auto font-mono text-xs">
								{consoleLogs.map((log, index) => (
									<div
										key={`${log.ts}-${index}`}
										className={`grid grid-cols-[58px_34px_1fr] items-start gap-1.5 sm:grid-cols-[86px_52px_1fr] sm:gap-2 ${
											log.level === "error"
												? "text-rose-300"
												: log.level === "ok"
													? "text-emerald-300"
													: "text-cyan-200"
										}`}>
										<span className="text-white/45">
											[{log.ts}]
										</span>
										<span>{log.label}</span>
										<span className="break-words">
											{log.message}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
