import React, { useEffect, useMemo, useState } from "react";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronDownIcon,
} from "../../utils/icons.jsx";
import {
	CALENDAR_EVENT_TYPE_FILTERS,
	buildMonthMatrix,
	dayKey,
	inferTimelineSource,
	sourceLabel,
} from "./shared.js";

const SEL =
	"h-8 rounded border border-white/10 bg-[#0a0a0a] px-2 text-xs text-white/65 focus:border-white/20 focus:outline-none";

export function CalendarView({
	juniors,
	events,
	canCreateEvent,
	onCreateEvent,
}) {
	const [monthCursor, setMonthCursor] = useState(() => {
		const sorted = (events || [])
			.slice()
			.sort(
				(a, b) =>
					new Date(a.startAt).getTime() -
					new Date(b.startAt).getTime(),
			);
		const first = sorted[0]?.startAt;
		const date = first ? new Date(first) : new Date();
		return new Date(date.getFullYear(), date.getMonth(), 1);
	});
	const [monthTouched, setMonthTouched] = useState(false);
	const [filters, setFilters] = useState({
		juniorId: "all",
		eventType: "all",
		source: "all",
	});
	const [addOpen, setAddOpen] = useState(false);
	const [form, setForm] = useState({
		title: "",
		eventType: "vocal",
		startAt: "",
		endAt: "",
		juniorIds: [],
	});
	const [status, setStatus] = useState("");

	const monthCells = useMemo(
		() => buildMonthMatrix(monthCursor),
		[monthCursor],
	);
	const monthLabel = monthCursor.toLocaleDateString("fr-FR", {
		month: "long",
		year: "numeric",
	});

	useEffect(() => {
		if (monthTouched || !(events || []).length) return;
		const sorted = (events || [])
			.slice()
			.sort(
				(a, b) =>
					new Date(a.startAt).getTime() -
					new Date(b.startAt).getTime(),
			);
		const first = sorted[0]?.startAt;
		if (!first) return;
		const date = new Date(first);
		setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
	}, [events, monthTouched]);

	const visibleEvents = (events || []).filter((item) => {
		const byJunior =
			filters.juniorId === "all"
				? true
				: (item.juniors || []).some((j) => j.id === filters.juniorId);
		const byType =
			filters.eventType === "all"
				? true
				: item.eventType === filters.eventType;
		const bySource =
			filters.source === "all"
				? true
				: inferTimelineSource(item) === filters.source;
		return byJunior && byType && bySource;
	});

	const perDay = visibleEvents.reduce((acc, item) => {
		const key = dayKey(item.startAt);
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {});

	for (const key of Object.keys(perDay)) {
		perDay[key].sort(
			(a, b) =>
				new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
		);
	}

	async function submit() {
		if (!form.title.trim() || !form.startAt) {
			setStatus("Titre et début requis.");
			return;
		}
		setStatus("Ajout...");
		try {
			await onCreateEvent(form);
			setStatus("Évènement ajouté.");
			setForm((prev) => ({
				...prev,
				title: "",
				startAt: "",
				endAt: "",
				juniorIds: [],
			}));
			setAddOpen(false);
		} catch (error) {
			setStatus(error.message || "Erreur.");
		}
	}

	return (
		<div className="space-y-5">
			<div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
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
								<option value="all">Tous les juniors</option>
								{juniors.map((j) => (
									<option key={j.id} value={j.id}>
										{j.displayName}
									</option>
								))}
							</select>
						) : null}
						<select
							value={filters.eventType}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									eventType: e.target.value,
								}))
							}
							className={SEL}>
							{CALENDAR_EVENT_TYPE_FILTERS.map((item) => (
								<option key={item} value={item}>
									{item === "all" ? "Tous les types" : item}
								</option>
							))}
						</select>
						<select
							value={filters.source}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									source: e.target.value,
								}))
							}
							className={SEL}>
							<option value="all">Toutes les sources</option>
							<option value="planned">Templates prévus</option>
							<option value="responsable">
								Ajouts responsable
							</option>
							<option value="referent">Ajouts référent</option>
						</select>
					</div>

					<div className="rounded-full border border-white/15 bg-black/30 px-2 py-1">
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => (
									setMonthTouched(true),
									setMonthCursor(
										(prev) =>
											new Date(
												prev.getFullYear(),
												prev.getMonth() - 1,
												1,
											),
									)
								)}
								className="flex h-7 w-7 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white">
								<ChevronLeftIcon className="h-4 w-4" />
							</button>
							<p className="min-w-[92px] text-center text-xs font-medium uppercase tracking-[0.13em] text-white/70">
								Semaine
							</p>
							<button
								type="button"
								onClick={() => (
									setMonthTouched(true),
									setMonthCursor(
										(prev) =>
											new Date(
												prev.getFullYear(),
												prev.getMonth() + 1,
												1,
											),
									)
								)}
								className="flex h-7 w-7 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white">
								<ChevronRightIcon className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 p-3 sm:p-4">
					<div className="mb-3 flex items-center justify-between">
						<h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
							Calendrier mensuel
						</h4>
						<p className="text-sm text-white/45">{monthLabel}</p>
					</div>

					<div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">
						{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
							(label) => (
								<p key={label}>{label}</p>
							),
						)}
					</div>

					<div className="grid grid-cols-7 gap-1.5">
						{monthCells.map((day, index) => {
							if (!day) {
								return (
									<div
										key={`empty-${index}`}
										className="min-h-[88px] rounded-lg border border-white/[0.03] bg-white/[0.01]"
									/>
								);
							}

							const key = dayKey(day);
							const isToday = dayKey(new Date()) === key;
							const items = (perDay[key] || []).slice(0, 2);

							return (
								<div
									key={key}
									className={`min-h-[88px] rounded-lg border p-2 ${
										isToday
											? "border-white/30 bg-white/[0.09]"
											: "border-white/[0.08] bg-white/[0.03]"
									}`}>
									<p
										className={`mb-1 text-[11px] font-semibold ${
											isToday
												? "text-white"
												: "text-white/70"
										}`}>
										{day.getDate()}
									</p>
									<div className="space-y-1">
										{items.map((item) => (
											<div
												key={item.id}
												className="rounded bg-black/35 px-1.5 py-1">
												<p className="truncate text-[10px] text-white/70">
													{item.title}
												</p>
												<p className="text-[9px] text-white/40">
													{sourceLabel(
														inferTimelineSource(
															item,
														),
													)}
												</p>
											</div>
										))}
										{(perDay[key] || []).length > 2 ? (
											<p className="text-[10px] text-white/35">
												+
												{(perDay[key] || []).length - 2}
											</p>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{canCreateEvent ? (
				!addOpen ? (
					<button
						type="button"
						onClick={() => setAddOpen(true)}
						className="flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/55">
						<ChevronDownIcon className="h-3.5 w-3.5 rotate-[-90deg] transition-transform" />
						<span>Ajouter un évènement</span>
					</button>
				) : (
					<div className="space-y-3 rounded-md border border-white/[0.08] p-4">
						<div className="flex items-center justify-between">
							<p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
								Nouvel événement
							</p>
							<button
								type="button"
								onClick={() => {
									setAddOpen(false);
									setStatus("");
								}}
								className="text-xs text-white/30 hover:text-white/55">
								X
							</button>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							<input
								value={form.title}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								placeholder="Titre *"
								className="h-9 rounded border border-white/10 bg-transparent px-3 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none sm:col-span-2"
							/>
							<select
								value={form.eventType}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										eventType: e.target.value,
									}))
								}
								className={`${SEL} h-9`}>
								{CALENDAR_EVENT_TYPE_FILTERS.filter(
									(t) => t !== "all",
								).map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
							<input
								type="datetime-local"
								value={form.startAt}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										startAt: e.target.value,
									}))
								}
								className="h-9 rounded border border-white/10 bg-transparent px-3 text-xs text-white/70 focus:border-white/20 focus:outline-none"
							/>
							<input
								type="datetime-local"
								value={form.endAt}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										endAt: e.target.value,
									}))
								}
								className="h-9 rounded border border-white/10 bg-transparent px-3 text-xs text-white/70 focus:border-white/20 focus:outline-none"
							/>
							{juniors.length > 0 ? (
								<div className="sm:col-span-2">
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
															juniorIds: e.target
																.checked
																? [
																		...prev.juniorIds,
																		j.id,
																	]
																: prev.juniorIds.filter(
																		(id) =>
																			id !==
																			j.id,
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
						</div>
						<div className="flex items-center justify-between">
							{status ? (
								<p className="text-xs text-white/45">
									{status}
								</p>
							) : (
								<span />
							)}
							<button
								type="button"
								onClick={submit}
								className="rounded bg-white px-3 py-1.5 text-xs font-medium text-black">
								Ajouter
							</button>
						</div>
					</div>
				)
			) : (
				<p className="text-xs text-white/35">
					Tu n'as pas la permission d'ajouter des évènements.
				</p>
			)}
		</div>
	);
}
