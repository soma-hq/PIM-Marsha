import React, { useEffect, useState } from "react";
import { ChevronDownIcon } from "../../utils/icons.jsx";
import {
	FSI_PERIODS,
	FSI_PERIOD_LABELS,
	FSI_PERIOD_COLORS,
	COMPETENCE_TYPES,
	COMPETENCE_TYPE_COLORS,
	REFERENT_REVIEWS,
	OBJECTIVE_STATUS,
	OBJECTIVE_STATUS_LABELS,
	STATUS_OPTIONS,
	fsiEmptyState,
} from "./shared.js";

const SEL =
	"h-7 rounded border border-white/10 bg-[#0a0a0a] px-1.5 text-xs text-white/70 focus:border-white/25 focus:outline-none";

export function FsiView({ junior, fsiState, onSave, canEdit }) {
	const [tab, setTab] = useState("competences");
	const [draft, setDraft] = useState(fsiState || fsiEmptyState());
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState("");
	const [openPeriod, setOpenPeriod] = useState("1ere_periode");
	const [addCompType, setAddCompType] = useState(null);
	const [compForm, setCompForm] = useState({
		title: "",
		percent: "0",
		referentReview: REFERENT_REVIEWS[1],
	});
	const [addObjPeriod, setAddObjPeriod] = useState(null);
	const [objForm, setObjForm] = useState({
		title: "",
		status: OBJECTIVE_STATUS[0],
	});
	const [ressentiInputs, setRessentiInputs] = useState({});

	useEffect(() => {
		setDraft(fsiState || fsiEmptyState());
	}, [fsiState, junior.id]);

	async function save() {
		setSaving(true);
		setStatus("Enregistrement...");
		try {
			await onSave(draft);
			setStatus("FSI enregistrée.");
		} catch (error) {
			setStatus(error.message || "Erreur d'enregistrement.");
		} finally {
			setSaving(false);
		}
	}

	const competencesByType = COMPETENCE_TYPES.reduce((acc, type) => {
		acc[type] = (draft.competences || []).filter(
			(item) => item.type === type,
		);
		return acc;
	}, {});

	const uncategorized = (draft.competences || []).filter(
		(item) => !COMPETENCE_TYPES.includes(item.type),
	);

	const objectivesByPeriod = FSI_PERIODS.reduce((acc, period) => {
		acc[period] = (draft.objectifs || []).filter(
			(item) => item.period === period,
		);
		return acc;
	}, {});

	const juniorStatus =
		STATUS_OPTIONS.find((item) => item.value === junior.status)?.label ||
		junior.status;

	return (
		<div className="space-y-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-xl font-semibold text-white">
						{junior.displayName}
					</h3>
					<div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs text-white/45">
						<span>{junior.dispositif}</span>
						<span>·</span>
						<span>{juniorStatus}</span>
						{junior.referent ? (
							<>
								<span>·</span>
								<span>
									{junior.referent.name ||
										junior.referent.email}
								</span>
							</>
						) : null}
					</div>
				</div>
				{canEdit ? (
					<button
						type="button"
						onClick={save}
						disabled={saving}
						className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black disabled:opacity-40">
						{saving ? "Enregistrement..." : "Sauvegarder"}
					</button>
				) : null}
			</div>

			<div>
				<p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
					Note
				</p>
				<textarea
					rows={2}
					value={draft.note || ""}
					onChange={(e) =>
						setDraft((prev) => ({ ...prev, note: e.target.value }))
					}
					disabled={!canEdit}
					placeholder="Ajouter une note..."
					className="w-full resize-none rounded-md border border-white/[0.08] bg-transparent px-3 py-2 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none disabled:opacity-50"
				/>
			</div>

			<div className="flex gap-5 border-b border-white/[0.06]">
				{[
					{ key: "competences", label: "📋 Compétences" },
					{ key: "objectifs", label: "🏆 Objectifs" },
					{ key: "bilans", label: "📄 Bilans" },
				].map((item) => (
					<button
						key={item.key}
						type="button"
						onClick={() => setTab(item.key)}
						className={`-mb-px border-b-[1.5px] pb-2.5 text-sm transition-colors ${
							tab === item.key
								? "border-white font-medium text-white"
								: "border-transparent text-white/40 hover:text-white/65"
						}`}>
						{item.label}
					</button>
				))}
			</div>

			{tab === "competences" ? (
				<div className="space-y-5">
					{[
						...COMPETENCE_TYPES,
						...(uncategorized.length ? ["Autre"] : []),
					].map((type) => {
						const items =
							type === "Autre"
								? uncategorized
								: competencesByType[type] || [];
						const colorCls =
							COMPETENCE_TYPE_COLORS[type] ||
							"bg-white/10 text-white/55";
						return (
							<div key={type}>
								<div className="mb-2 flex items-center gap-2">
									<span className="text-[10px] text-white/30">
										▼
									</span>
									<span
										className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${colorCls}`}>
										{type}
									</span>
								</div>
								<div className="divide-y divide-white/[0.04]">
									{items.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 py-2.5 pr-2">
											<span className="w-8 shrink-0 text-right text-[11px] text-white/40">
												{item.percent}%
											</span>
											<div className="h-[3px] w-16 shrink-0 rounded-full bg-white/10">
												<div
													className="h-[3px] rounded-full bg-white/45"
													style={{
														width: `${Math.max(0, Math.min(100, Number(item.percent || 0)))}%`,
													}}
												/>
											</div>
											<span className="flex-1 text-sm text-white/85">
												{item.title}
											</span>
											<span className="shrink-0 text-xs text-white/30">
												{item.referentReview ||
													"Pas encore notée"}
											</span>
										</div>
									))}
									{items.length === 0 ? (
										<p className="py-2 text-xs text-white/25">
											Aucune compétence
										</p>
									) : null}
								</div>

								{canEdit ? (
									addCompType === type ? (
										<div className="mt-1 flex flex-wrap items-center gap-2 py-1">
											<input
												autoFocus
												value={compForm.title}
												onChange={(e) =>
													setCompForm((prev) => ({
														...prev,
														title: e.target.value,
													}))
												}
												onKeyDown={(e) => {
													if (e.key === "Escape")
														setAddCompType(null);
												}}
												placeholder="Nom de la compétence"
												className="h-7 min-w-[160px] flex-1 rounded border border-white/15 bg-transparent px-2 text-xs text-white placeholder-white/25 focus:border-white/30 focus:outline-none"
											/>
											<input
												type="number"
												min="0"
												max="100"
												value={compForm.percent}
												onChange={(e) =>
													setCompForm((prev) => ({
														...prev,
														percent: e.target.value,
													}))
												}
												placeholder="%"
												className="h-7 w-14 rounded border border-white/10 bg-transparent px-2 text-xs text-white focus:outline-none"
											/>
											<select
												value={compForm.referentReview}
												onChange={(e) =>
													setCompForm((prev) => ({
														...prev,
														referentReview:
															e.target.value,
													}))
												}
												className={SEL}>
												{REFERENT_REVIEWS.map((r) => (
													<option key={r} value={r}>
														{r}
													</option>
												))}
											</select>
											<button
												type="button"
												onClick={() => {
													if (!compForm.title.trim())
														return;
													setDraft((prev) => ({
														...prev,
														competences: [
															...(prev.competences ||
																[]),
															{
																id: crypto.randomUUID(),
																title: compForm.title,
																type,
																percent: Number(
																	compForm.percent ||
																		0,
																),
																referentReview:
																	compForm.referentReview,
															},
														],
													}));
													setCompForm((prev) => ({
														...prev,
														title: "",
														percent: "0",
													}));
													setAddCompType(null);
												}}
												className="h-7 rounded bg-white px-2.5 text-xs font-medium text-black">
												Ajouter
											</button>
											<button
												type="button"
												onClick={() =>
													setAddCompType(null)
												}
												className="text-xs text-white/30 hover:text-white/55">
												Annuler
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => {
												setCompForm((prev) => ({
													...prev,
													type,
												}));
												setAddCompType(type);
											}}
											className="mt-0.5 flex items-center gap-1 py-1 text-[11px] text-white/30 transition-colors hover:text-white/55">
											<span>+</span>
											<span>Ajouter une compétence</span>
										</button>
									)
								) : null}
							</div>
						);
					})}
				</div>
			) : null}

			{tab === "objectifs" ? (
				<div className="space-y-5">
					{FSI_PERIODS.map((period) => {
						const items = objectivesByPeriod[period] || [];
						const colorCls = FSI_PERIOD_COLORS[period];
						return (
							<div key={period}>
								<div className="mb-2 flex items-center gap-2">
									<span className="text-[10px] text-white/30">
										▼
									</span>
									<span
										className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${colorCls}`}>
										{FSI_PERIOD_LABELS[period]}
									</span>
								</div>
								<div className="divide-y divide-white/[0.04]">
									{items.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 py-2.5 pr-2">
											<span className="flex-1 text-sm text-white/85">
												{item.title}
											</span>
											<span
												className={`shrink-0 text-xs ${
													item.status === "termine"
														? "text-emerald-400"
														: item.status ===
															  "en_cours"
															? "text-amber-400"
															: "text-white/35"
												}`}>
												{OBJECTIVE_STATUS_LABELS[
													item.status
												] || item.status}
											</span>
										</div>
									))}
									{items.length === 0 ? (
										<p className="py-2 text-xs text-white/25">
											Aucun objectif
										</p>
									) : null}
								</div>

								{canEdit ? (
									addObjPeriod === period ? (
										<div className="mt-1 flex flex-wrap items-center gap-2 py-1">
											<input
												autoFocus
												value={objForm.title}
												onChange={(e) =>
													setObjForm((prev) => ({
														...prev,
														title: e.target.value,
													}))
												}
												onKeyDown={(e) => {
													if (e.key === "Escape")
														setAddObjPeriod(null);
												}}
												placeholder="Titre de l'objectif"
												className="h-7 min-w-[160px] flex-1 rounded border border-white/15 bg-transparent px-2 text-xs text-white placeholder-white/25 focus:border-white/30 focus:outline-none"
											/>
											<select
												value={objForm.status}
												onChange={(e) =>
													setObjForm((prev) => ({
														...prev,
														status: e.target.value,
													}))
												}
												className={SEL}>
												{OBJECTIVE_STATUS.map((s) => (
													<option key={s} value={s}>
														{OBJECTIVE_STATUS_LABELS[
															s
														] || s}
													</option>
												))}
											</select>
											<button
												type="button"
												onClick={() => {
													if (!objForm.title.trim())
														return;
													setDraft((prev) => ({
														...prev,
														objectifs: [
															...(prev.objectifs ||
																[]),
															{
																id: crypto.randomUUID(),
																title: objForm.title,
																period,
																status: objForm.status,
																competenceId:
																	null,
															},
														],
													}));
													setObjForm((prev) => ({
														...prev,
														title: "",
													}));
													setAddObjPeriod(null);
												}}
												className="h-7 rounded bg-white px-2.5 text-xs font-medium text-black">
												Ajouter
											</button>
											<button
												type="button"
												onClick={() =>
													setAddObjPeriod(null)
												}
												className="text-xs text-white/30 hover:text-white/55">
												Annuler
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => {
												setObjForm((prev) => ({
													...prev,
													period,
												}));
												setAddObjPeriod(period);
											}}
											className="mt-0.5 flex items-center gap-1 py-1 text-[11px] text-white/30 transition-colors hover:text-white/55">
											<span>+</span>
											<span>Ajouter un objectif</span>
										</button>
									)
								) : null}
							</div>
						);
					})}
				</div>
			) : null}

			{tab === "bilans" ? (
				<div className="space-y-2">
					{FSI_PERIODS.map((period) => {
						const bilan =
							draft.bilans?.[period] ||
							fsiEmptyState().bilans[period];
						const colorCls = FSI_PERIOD_COLORS[period];
						const periodObjectives = (draft.objectifs || []).filter(
							(item) => item.period === period,
						);
						return (
							<div
								key={period}
								className="overflow-hidden rounded-md border border-white/[0.08]">
								<button
									type="button"
									onClick={() =>
										setOpenPeriod((prev) =>
											prev === period ? "" : period,
										)
									}
									className="flex w-full items-center justify-between px-4 py-3 text-left">
									<span
										className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${colorCls}`}>
										{FSI_PERIOD_LABELS[period]}
									</span>
									<ChevronDownIcon
										className={`h-4 w-4 text-white/40 transition-transform duration-300 ${
											openPeriod === period
												? "rotate-180"
												: ""
										}`}
									/>
								</button>

								{openPeriod === period ? (
									<div className="space-y-4 border-t border-white/[0.06] px-4 py-4">
										<div>
											<p className="mb-2 text-[11px] uppercase tracking-[0.13em] text-white/30">
												Ressentis du Junior
											</p>
											<div className="mb-2 space-y-1">
												{(bilan.ressentis || []).map(
													(item) => (
														<p
															key={item.id}
															className="text-sm text-white/70">
															· {item.text}
														</p>
													),
												)}
											</div>
											{canEdit ? (
												<div className="flex gap-2">
													<input
														value={
															ressentiInputs[
																period
															] || ""
														}
														onChange={(e) =>
															setRessentiInputs(
																(prev) => ({
																	...prev,
																	[period]:
																		e.target
																			.value,
																}),
															)
														}
														placeholder="Ajouter un ressenti"
														className="h-7 flex-1 rounded border border-white/10 bg-transparent px-2 text-xs text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
													/>
													<button
														type="button"
														onClick={() => {
															const value =
																ressentiInputs[
																	period
																] || "";
															if (!value.trim())
																return;
															setDraft(
																(prev) => ({
																	...prev,
																	bilans: {
																		...prev.bilans,
																		[period]:
																			{
																				...prev
																					.bilans[
																					period
																				],
																				ressentis:
																					[
																						...(prev
																							.bilans[
																							period
																						]
																							?.ressentis ||
																							[]),
																						{
																							id: crypto.randomUUID(),
																							text: value,
																						},
																					],
																			},
																	},
																}),
															);
															setRessentiInputs(
																(prev) => ({
																	...prev,
																	[period]:
																		"",
																}),
															);
														}}
														className="h-7 rounded bg-white/10 px-2.5 text-xs text-white/80 hover:bg-white/15">
														+
													</button>
												</div>
											) : null}
										</div>

										<div>
											<p className="mb-2 text-[11px] uppercase tracking-[0.13em] text-white/30">
												Objectifs de la période
											</p>
											{periodObjectives.length === 0 ? (
												<p className="text-xs text-white/30">
													Aucun objectif défini.
												</p>
											) : (
												<div className="space-y-1">
													{periodObjectives.map(
														(item) => (
															<p
																key={item.id}
																className="text-sm text-white/65">
																· {item.title} —{" "}
																<span className="text-white/35">
																	{OBJECTIVE_STATUS_LABELS[
																		item
																			.status
																	] ||
																		item.status}
																</span>
															</p>
														),
													)}
												</div>
											)}
										</div>

										<div>
											<p className="mb-2 text-[11px] uppercase tracking-[0.13em] text-white/30">
												Bilan final
											</p>
											<textarea
												rows={3}
												value={bilan.finalText || ""}
												disabled={!canEdit}
												onChange={(e) =>
													setDraft((prev) => ({
														...prev,
														bilans: {
															...prev.bilans,
															[period]: {
																...prev.bilans[
																	period
																],
																finalText:
																	e.target
																		.value,
															},
														},
													}))
												}
												placeholder="Résumé de la période..."
												className="w-full resize-none rounded border border-white/[0.08] bg-transparent px-3 py-2 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none disabled:opacity-50"
											/>
										</div>

										<div>
											<p className="mb-2 text-[11px] uppercase tracking-[0.13em] text-white/30">
												Validation
											</p>
											<div className="grid grid-cols-2 gap-y-2">
												{Object.keys(
													bilan.validation || {},
												).map((checkKey) => (
													<label
														key={checkKey}
														className="flex items-center gap-2 text-xs text-white/55">
														<input
															type="checkbox"
															checked={Boolean(
																bilan
																	.validation?.[
																	checkKey
																],
															)}
															disabled={!canEdit}
															onChange={(e) =>
																setDraft(
																	(prev) => ({
																		...prev,
																		bilans: {
																			...prev.bilans,
																			[period]:
																				{
																					...prev
																						.bilans[
																						period
																					],
																					validation:
																						{
																							...prev
																								.bilans[
																								period
																							]
																								.validation,
																							[checkKey]:
																								e
																									.target
																									.checked,
																						},
																				},
																		},
																	}),
																)
															}
														/>
														{checkKey}
													</label>
												))}
											</div>
										</div>
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			) : null}

			{status ? <p className="text-xs text-white/40">{status}</p> : null}
		</div>
	);
}
