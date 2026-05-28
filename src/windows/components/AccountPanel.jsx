import React, { useState } from "react";

import { updateMe } from "../utils/api/client.jsx";

/**
 * Renders Account Panel
 * @param {{ user: any, onClose: () => void, onUserUpdated: (user: any) => void }} props Panel Props
 * @returns {JSX.Element} Panel View
 */

export function AccountPanel({ user, onClose, onUserUpdated }) {
	const [form, setForm] = useState({
		name: user?.name || "",
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		email: user?.email || "",
		avatarUrl: user?.avatarUrl || "",
		password: "",
	});
	const [status, setStatus] = useState("");

	/**
	 * Updates One Field
	 * @param {string} key Field Key
	 * @param {string} value Field Value
	 * @returns {void} Nothing
	 */

	function updateField(key, value) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	/**
	 * Saves User Profile
	 * @param {React.FormEvent<HTMLFormElement>} event Submit Event
	 * @returns {Promise<void>} Async Done
	 */

	async function saveProfile(event) {
		event.preventDefault();
		setStatus("Enregistrement...");
		try {
			const payload = {
				name: form.name,
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				avatarUrl: form.avatarUrl || null,
			};
			if (form.password.trim()) payload.password = form.password;

			const response = await updateMe(payload);
			onUserUpdated(response.user);
			setForm((prev) => ({ ...prev, password: "" }));
			setStatus("Profil mis à jour.");
		} catch (error) {
			setStatus(
				error.message || "Impossible de mettre à jour le profil.",
			);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-20 backdrop-blur-sm">
			<div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#090909] p-6 shadow-2xl">
				<div className="mb-5 flex items-center justify-between">
					<div>
						<h3 className="text-2xl font-bold">Mon compte</h3>
						<p className="text-sm text-white/55">
							Profil, avatar et sécurité.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:text-white">
						Fermer
					</button>
				</div>

				<form className="grid gap-4" onSubmit={saveProfile}>
					<div className="grid gap-4 md:grid-cols-2">
						<label className="space-y-2 text-sm">
							<span className="text-white/70">
								Nom d'affichage
							</span>
							<input
								value={form.name}
								onChange={(event) =>
									updateField("name", event.target.value)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							/>
						</label>
						<label className="space-y-2 text-sm">
							<span className="text-white/70">Email</span>
							<input
								type="email"
								value={form.email}
								onChange={(event) =>
									updateField("email", event.target.value)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							/>
						</label>
						<label className="space-y-2 text-sm">
							<span className="text-white/70">Prénom</span>
							<input
								value={form.firstName}
								onChange={(event) =>
									updateField("firstName", event.target.value)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							/>
						</label>
						<label className="space-y-2 text-sm">
							<span className="text-white/70">Nom</span>
							<input
								value={form.lastName}
								onChange={(event) =>
									updateField("lastName", event.target.value)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							/>
						</label>
					</div>

					<label className="space-y-2 text-sm">
						<span className="text-white/70">URL de l'avatar</span>
						<input
							value={form.avatarUrl}
							onChange={(event) =>
								updateField("avatarUrl", event.target.value)
							}
							className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							placeholder="https://..."
						/>
					</label>

					<label className="space-y-2 text-sm">
						<span className="text-white/70">
							Nouveau mot de passe
						</span>
						<input
							type="password"
							value={form.password}
							onChange={(event) =>
								updateField("password", event.target.value)
							}
							className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3"
							placeholder="Laisser vide pour ne pas changer"
						/>
					</label>

					<div className="flex items-center justify-between">
						<p className="text-sm text-white/65">{status}</p>
						<button
							type="submit"
							className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
							Enregistrer
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
