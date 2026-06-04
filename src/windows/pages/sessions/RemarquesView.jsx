import React, { useState } from "react";

const SEL =
	"h-8 rounded border border-white/10 bg-[#0a0a0a] px-2 text-xs text-white/65 focus:border-white/20 focus:outline-none";

export function RemarquesView({ juniors, remarks, onCreateRemark }) {
	const [filters, setFilters] = useState({
		periodicity: "all",
		nature: "all",
		hierarchy: "all",
		juniorId: "all",
	});
	const [addOpen, setAddOpen] = useState(false);
	const [form, setForm] = useState({
		title: "",
		periodicity: "hebdomadaire",
		nature: "note",
		hierarchy: "medium",
		juniorIds: [],
		contexte: "",
		faits: "",
		action: "",
	});
	const [status, setStatus] = useState("");

	const filtered = (remarks || []).filter((item) => {
		const periodicity =
			String(item.title || "").match(/\[(.*?)\]/)?.[1] || "none";
		const byPeriodicity =
			filters.periodicity === "all"
				? true
				: periodicity === filters.periodicity;
		const byNature =
			filters.nature === "all"
				? true
				: String(item.content || "")
						.toLowerCase()
						.includes(`nature:${filters.nature}`);
		const byHierarchy =
			filters.hierarchy === "all"
				? true
				: String(item.priority || "") === filters.hierarchy;
		const byJunior =
			filters.juniorId === "all"
				? true
				: (item.juniors || []).some((j) => j.id === filters.juniorId);
		return byPeriodicity && byNature && byHierarchy && byJunior;
	});

	const grouped = filtered.reduce((acc, item) => {
		const key = String(item.title || "").match(/\[(.*?)\]/)?.[1] || "Autre";
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {});

	const PRIORITY_CLS = {
		critical: "bg-red-900/50 text-red-300",
		high: "bg-orange-900/50 text-orange-300",
		medium: "bg-yellow-900/50 text-yellow-300",
		low: "bg-white/10 text-white/40",
	};

	async function submit() {
		if (!form.title.trim() || !form.faits.trim()) {
			setStatus("Titre et faits requis.");
			return;
		}
		setStatus("Création...");
		try {
			await onCreateRemark({
				title: `[${form.periodicity}] ${form.title}`,
				priority: form.hierarchy,
				scope: form.juniorIds.length ? "junior" : "general",
				juniorIds: form.juniorIds,
				content: `nature:${form.nature}\ncontexte:${form.contexte}\nfaits:${form.faits}\naction:${form.action}`,
			});
			setStatus("Créée.");
			setForm((prev) => ({
				...prev,
				title: "",
				contexte: "",
				faits: "",
				action: "",
				juniorIds: [],
			}));
			setAddOpen(false);
		} catch (error) {
			setStatus(error.message || "Erreur.");
		}
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap gap-2">
				<select
					value={filters.periodicity}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							periodicity: e.target.value,
						}))
					}
					className={SEL}>
					<option value="all">Périodicité : toutes</option>
					<option value="hebdomadaire">Hebdomadaire</option>
					<option value="mensuelle">Mensuelle</option>
					<option value="ponctuelle">Ponctuelle</option>
				</select>
				<select
					value={filters.nature}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							nature: e.target.value,
						}))
					}
					className={SEL}>
					<option value="all">Nature : toutes</option>
					<option value="note">Note</option>
					<option value="alerte">Alerte</option>
					<option value="incident">Incident</option>
					<option value="positif">Positif</option>
				</select>
				<select
					value={filters.hierarchy}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							hierarchy: e.target.value,
						}))
					}
					className={SEL}>
					<option value="all">Hiérarchie : toutes</option>
					<option value="low">Faible</option>
					<option value="medium">Moyenne</option>
					<option value="high">Haute</option>
					<option value="critical">Critique</option>
				</select>
				{juniors.length > 0 ? (
					<select
						value={filters.juniorId}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								juniorId: e.target.value,
							}))
						}
						className={SEL}>
						<option value="all">Junior : tous</option>
						{juniors.map((j) => (
							<option key={j.id} value={j.id}>
								{j.displayName}
							</option>
						))}
					</select>
				) : null}
			</div>

			<div className="space-y-5">
				{Object.keys(grouped).map((periodicity) => (
					<div key={periodicity}>
						<p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
							{periodicity}
						</p>
						<div className="divide-y divide-white/[0.04]">
							{grouped[periodicity].map((item) => (
								<div key={item.id} className="py-3">
									<div className="flex items-start justify-between gap-3">
										<p className="text-sm text-white/85">
											{item.title}
										</p>
										{item.priority ? (
											<span
												className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${PRIORITY_CLS[item.priority] || "bg-white/10 text-white/40"}`}>
												{item.priority}
											</span>
										) : null}
									</div>
									{item.content ? (
										<p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-white/40">
											{item.content}
										</p>
									) : null}
								</div>
							))}
						</div>
					</div>
				))}
				{Object.keys(grouped).length === 0 ? (
					<p className="text-sm text-white/35">Aucune remarque.</p>
				) : null}
			</div>

			{!addOpen ? (
				<button
					type="button"
					onClick={() => setAddOpen(true)}
					className="flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/55">
					<span>+</span>
					<span>Ajouter une remarque</span>
				</button>
			) : (
				<div className="space-y-3 rounded-md border border-white/[0.08] p-4">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
							Nouvelle remarque
						</p>
						<button
							type="button"
							onClick={() => {
								setAddOpen(false);
								setStatus("");
							}}
							className="text-xs text-white/30 hover:text-white/55">
							✕
						</button>
					</div>
					<input
						value={form.title}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								title: e.target.value,
							}))
						}
						placeholder="Titre"
						className="h-9 w-full rounded border border-white/10 bg-transparent px-3 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
					/>
					<div className="flex flex-wrap gap-2">
						<select
							value={form.periodicity}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									periodicity: e.target.value,
								}))
							}
							className={SEL}>
							<option value="hebdomadaire">Hebdomadaire</option>
							<option value="mensuelle">Mensuelle</option>
							<option value="ponctuelle">Ponctuelle</option>
						</select>
						<select
							value={form.nature}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									nature: e.target.value,
								}))
							}
							className={SEL}>
							<option value="note">Note</option>
							<option value="alerte">Alerte</option>
							<option value="incident">Incident</option>
							<option value="positif">Positif</option>
						</select>
						<select
							value={form.hierarchy}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									hierarchy: e.target.value,
								}))
							}
							className={SEL}>
							<option value="low">Faible</option>
							<option value="medium">Moyenne</option>
							<option value="high">Haute</option>
							<option value="critical">Critique</option>
						</select>
					</div>
					{juniors.length > 0 ? (
						<div>
							<p className="mb-1.5 text-xs text-white/40">
								Juniors concernés
							</p>
							<div className="flex flex-wrap gap-3">
								{juniors.map((j) => (
									<label
										key={j.id}
										className="flex items-center gap-1.5 text-xs text-white/55">
										<input
											type="checkbox"
											checked={form.juniorIds.includes(
												j.id,
											)}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													juniorIds: e.target.checked
														? [
																...prev.juniorIds,
																j.id,
															]
														: prev.juniorIds.filter(
																(id) =>
																	id !== j.id,
															),
												}))
											}
										/>
										{j.displayName}
									</label>
								))}
							</div>
						</div>
					) : null}
					<textarea
						rows={2}
						value={form.faits}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								faits: e.target.value,
							}))
						}
						placeholder="Faits observés *"
						className="w-full resize-none rounded border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
					/>
					<textarea
						rows={2}
						value={form.contexte}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								contexte: e.target.value,
							}))
						}
						placeholder="Contexte (optionnel)"
						className="w-full resize-none rounded border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
					/>
					<textarea
						rows={2}
						value={form.action}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								action: e.target.value,
							}))
						}
						placeholder="Action recommandée (optionnel)"
						className="w-full resize-none rounded border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
					/>
					<div className="flex items-center justify-between">
						{status ? (
							<p className="text-xs text-white/45">{status}</p>
						) : (
							<span />
						)}
						<button
							type="button"
							onClick={submit}
							className="rounded bg-white px-3 py-1.5 text-xs font-medium text-black">
							Créer la remarque
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
