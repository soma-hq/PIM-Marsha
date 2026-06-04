import React, { useMemo, useState } from "react";
import {
	STATUS_OPTIONS,
	dayKey,
	weekDays,
	formatDateOrFallback,
} from "./shared.js";

const SEL =
	"h-8 rounded border border-white/10 bg-[#0a0a0a] px-2 text-xs text-white/70 focus:border-white/25 focus:outline-none";

export function HubView({
	juniorRows,
	events,
	trainings,
	referents,
	canEditJuniors,
	onCreateJunior,
	onUpdateJunior,
	hubSection,
	onJuniorSelect,
	selectedJuniorId,
}) {
	const [weekCursor, setWeekCursor] = useState(new Date());
	const [addOpen, setAddOpen] = useState(false);
	const [createForm, setCreateForm] = useState({
		displayName: "",
		dispositif: "ATRIA",
		referentId: "",
	});
	const [createStatus, setCreateStatus] = useState("");

	const days = useMemo(() => weekDays(weekCursor), [weekCursor]);

	const eventsByDay = useMemo(() => {
		const map = new Map();
		for (const day of days) map.set(dayKey(day), []);
		for (const event of events || []) {
			const key = dayKey(event.startAt);
			if (map.has(key)) map.get(key).push(event);
		}
		return map;
	}, [days, events]);

	return (
		<div className="space-y-6">
			{hubSection === "prelude" ? (
				<p className="leading-relaxed text-sm text-white/55">
					Sélectionne un Junior pour ouvrir sa FSI, puis utilise les
					pages Remarques et Calendrier pour compléter le suivi.
				</p>
			) : null}

			{hubSection === "formations" ? (
				<div>
					{(trainings || []).length === 0 ? (
						<p className="text-sm text-white/40">
							Aucune formation suivie pour cette session.
						</p>
					) : (
						<div className="divide-y divide-white/[0.05]">
							{(trainings || []).map((training) => (
								<div
									key={training.id}
									className="flex items-center justify-between py-3">
									<p className="text-sm text-white/85">
										{training.title || "Formation"}
									</p>
									<p className="text-xs text-white/35">
										{new Date(
											training.createdAt,
										).toLocaleDateString("fr-FR")}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			) : null}

			{hubSection === "notes" || hubSection === "formations" ? (
				<div>
					{juniorRows.length === 0 ? (
						<p className="text-sm text-white/35">
							Aucun junior dans cette session.
						</p>
					) : (
						<table className="w-full min-w-[600px] text-sm">
							<thead>
								<tr>
									<th className="pb-2 pr-4 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-white/30">
										Nom
									</th>
									<th className="pb-2 pr-4 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-white/30">
										Dispositif
									</th>
									<th className="pb-2 pr-4 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-white/30">
										État
									</th>
									<th className="pb-2 pr-4 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-white/30">
										Référent
									</th>
									<th className="pb-2 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-white/30">
										Depuis
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/[0.04]">
								{juniorRows.map((junior) => (
									<tr
										key={junior.id}
										className={
											selectedJuniorId === junior.id
												? "bg-white/[0.02]"
												: ""
										}>
										<td className="py-2.5 pr-4">
											<button
												type="button"
												onClick={() =>
													onJuniorSelect(junior.id)
												}
												className="text-sm text-white/85 transition-colors hover:text-cyan-300">
												{junior.displayName}
											</button>
										</td>
										<td className="py-2.5 pr-4 text-xs text-white/50">
											{junior.dispositif}
										</td>
										<td className="py-2.5 pr-4">
											{canEditJuniors ? (
												<select
													value={
														junior.status ||
														"non_debutee"
													}
													onChange={(e) =>
														onUpdateJunior(junior, {
															status: e.target
																.value,
														})
													}
													className={SEL}>
													{STATUS_OPTIONS.map(
														(opt) => (
															<option
																key={opt.value}
																value={
																	opt.value
																}>
																{opt.label}
															</option>
														),
													)}
												</select>
											) : (
												<span className="text-xs text-white/55">
													{STATUS_OPTIONS.find(
														(item) =>
															item.value ===
															junior.status,
													)?.label || junior.status}
												</span>
											)}
										</td>
										<td className="py-2.5 pr-4">
											{canEditJuniors ? (
												<select
													value={
														junior.referentId || ""
													}
													onChange={(e) =>
														onUpdateJunior(junior, {
															referentId:
																e.target
																	.value ||
																null,
														})
													}
													className={SEL}>
													<option value="">
														Aucun
													</option>
													{(referents || []).map(
														(ref) => (
															<option
																key={ref.id}
																value={ref.id}>
																{ref.name ||
																	ref.email}
															</option>
														),
													)}
												</select>
											) : (
												<span className="text-xs text-white/45">
													{junior.referent?.name ||
														junior.referent
															?.email ||
														"—"}
												</span>
											)}
										</td>
										<td className="py-2.5 text-xs text-white/35">
											{formatDateOrFallback(
												junior.startDate ||
													junior.createdAt,
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					{canEditJuniors ? (
						<div className="mt-1">
							{!addOpen ? (
								<button
									type="button"
									onClick={() => setAddOpen(true)}
									className="flex items-center gap-1.5 py-2 text-xs text-white/30 transition-colors hover:text-white/55">
									<span>+</span>
									<span>Ajouter un junior</span>
								</button>
							) : (
								<div className="mt-2 flex flex-wrap items-center gap-2">
									<input
										autoFocus
										value={createForm.displayName}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												displayName: e.target.value,
											}))
										}
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												setAddOpen(false);
												setCreateForm({
													displayName: "",
													dispositif: "ATRIA",
													referentId: "",
												});
											}
										}}
										placeholder="Nom du junior"
										className="h-8 rounded border border-white/15 bg-transparent px-3 text-sm text-white placeholder-white/25 focus:border-white/30 focus:outline-none"
									/>
									<select
										value={createForm.dispositif}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												dispositif: e.target.value,
											}))
										}
										className={SEL}>
										<option value="ATRIA">ATRIA</option>
										<option value="PULSE">PULSE</option>
									</select>
									<select
										value={createForm.referentId}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												referentId: e.target.value,
											}))
										}
										className={SEL}>
										<option value="">
											Référent (optionnel)
										</option>
										{(referents || []).map((ref) => (
											<option key={ref.id} value={ref.id}>
												{ref.name || ref.email}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={async () => {
											if (!createForm.displayName.trim())
												return;
											setCreateStatus("...");
											try {
												await onCreateJunior(
													createForm,
												);
												setCreateStatus("");
												setCreateForm({
													displayName: "",
													dispositif: "ATRIA",
													referentId: "",
												});
												setAddOpen(false);
											} catch (error) {
												setCreateStatus(
													error.message || "Erreur.",
												);
											}
										}}
										className="h-8 rounded bg-white px-3 text-xs font-medium text-black">
										Ajouter
									</button>
									<button
										type="button"
										onClick={() => {
											setAddOpen(false);
											setCreateForm({
												displayName: "",
												dispositif: "ATRIA",
												referentId: "",
											});
											setCreateStatus("");
										}}
										className="text-xs text-white/30 hover:text-white/55">
										Annuler
									</button>
									{createStatus ? (
										<p className="text-xs text-white/45">
											{createStatus}
										</p>
									) : null}
								</div>
							)}
						</div>
					) : null}
				</div>
			) : null}

			{hubSection === "notes" ? (
				<div>
					<div className="mb-3 flex items-center justify-between">
						<p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
							Semaine
						</p>
						<div className="flex gap-0.5">
							<button
								type="button"
								onClick={() =>
									setWeekCursor(
										(prev) =>
											new Date(
												prev.getFullYear(),
												prev.getMonth(),
												prev.getDate() - 7,
											),
									)
								}
								className="px-2 py-1 text-xs text-white/40 transition-colors hover:text-white/65">
								←
							</button>
							<button
								type="button"
								onClick={() =>
									setWeekCursor(
										(prev) =>
											new Date(
												prev.getFullYear(),
												prev.getMonth(),
												prev.getDate() + 7,
											),
									)
								}
								className="px-2 py-1 text-xs text-white/40 transition-colors hover:text-white/65">
								→
							</button>
						</div>
					</div>
					<div className="grid gap-1.5 md:grid-cols-7">
						{days.map((day) => {
							const key = dayKey(day);
							const isToday = dayKey(new Date()) === key;
							const dayEvents = (
								eventsByDay.get(key) || []
							).slice(0, 4);
							return (
								<div
									key={key}
									className={`min-h-[72px] rounded-md border p-2 ${
										isToday
											? "border-white/25 bg-white/[0.04]"
											: "border-white/[0.06]"
									}`}>
									<p
										className={`mb-1.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
											isToday
												? "text-white/75"
												: "text-white/30"
										}`}>
										{day.toLocaleDateString("fr-FR", {
											weekday: "short",
											day: "2-digit",
										})}
									</p>
									<div className="space-y-0.5">
										{dayEvents.map((event) => (
											<div
												key={event.id}
												className="truncate rounded bg-white/[0.06] px-1.5 py-0.5">
												<p className="truncate text-[10px] text-white/60">
													{event.title}
												</p>
											</div>
										))}
										{dayEvents.length === 0 ? (
											<p className="text-[10px] text-white/20">
												—
											</p>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			) : null}
		</div>
	);
}
