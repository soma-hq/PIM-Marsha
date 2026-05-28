import React, { useState } from "react";

import { updateMe } from "../utils/api/client.jsx";

/**
 * Renders Force Password Modal
 * @param {{ onCompleted: (user: any) => void }} props Modal Props
 * @returns {JSX.Element} Modal View
 */

export function ForcePasswordModal({ onCompleted }) {
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [status, setStatus] = useState("");

	/**
	 * Saves New Password
	 * @param {React.FormEvent<HTMLFormElement>} event Submit Event
	 * @returns {Promise<void>} Async Done
	 */

	async function submit(event) {
		event.preventDefault();
		if (password.length < 8) {
			setStatus("Le mot de passe doit contenir au moins 8 caractères.");
			return;
		}
		if (password !== confirm) {
			setStatus("Les mots de passe ne correspondent pas.");
			return;
		}

		setStatus("Mise à jour...");
		try {
			const response = await updateMe({ password });
			onCompleted(response.user);
		} catch (error) {
			setStatus(
				error.message || "Impossible de mettre à jour le mot de passe.",
			);
		}
	}

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4">
			<form
				onSubmit={submit}
				className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
				<h3 className="text-xl font-bold">Change ton mot de passe</h3>
				<p className="mt-2 text-sm text-white/60">
					Ton compte a été créé avec un mot de passe par défaut.
					Change-le maintenant pour continuer.
				</p>
				<label className="mt-4 block text-sm">
					<span className="text-white/70">Nouveau mot de passe</span>
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
					/>
				</label>
				<label className="mt-3 block text-sm">
					<span className="text-white/70">Confirmation</span>
					<input
						type="password"
						value={confirm}
						onChange={(event) => setConfirm(event.target.value)}
						className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
					/>
				</label>
				<div className="mt-5 flex items-center justify-between">
					<p className="text-xs text-white/65">{status}</p>
					<button
						type="submit"
						className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
						Valider
					</button>
				</div>
			</form>
		</div>
	);
}
