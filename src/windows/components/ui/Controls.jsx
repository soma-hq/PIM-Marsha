import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Formats Date Label
 * @param {string|Date|null|undefined} value Raw Date
 * @returns {string} Formatted Label
 */

function formatDateValue(value) {
	if (!value) return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("fr-FR", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/**
 * Builds Month Grid
 * @param {number} year Target Year
 * @param {number} month Target Month
 * @returns {(Date|null)[]} Calendar Cells
 */

function buildCalendarMatrix(year, month) {
	const firstDay = new Date(year, month, 1);
	const startDay = (firstDay.getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = [];

	for (let i = 0; i < startDay; i += 1) cells.push(null);
	for (let day = 1; day <= daysInMonth; day += 1)
		cells.push(new Date(year, month, day));
	while (cells.length % 7 !== 0) cells.push(null);

	return cells;
}

/**
 * Renders Fancy Select
 * @param {{ label?: string, value: string, options: Array<{ value: string, label: string, description?: string, logoUrl?: string|null }>, onChange: (value: string) => void, placeholder?: string }} props Select Props
 * @returns {JSX.Element} Select View
 */

export function FancySelect({
	label,
	value,
	options,
	onChange,
	placeholder = "Choisir...",
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const selected = options.find((option) => option.value === value) || null;

	useEffect(() => {
		/**
		 * Handles Outside Click
		 * @param {MouseEvent} event Browser Event
		 * @returns {void} Nothing
		 */

		function onPointerDown(event) {
			if (rootRef.current && !rootRef.current.contains(event.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	return (
		<div ref={rootRef} className="relative">
			{label ? (
				<span className="mb-2 block text-sm text-white/70">
					{label}
				</span>
			) : null}
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex h-12 w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-black/45 px-4 text-left text-white transition hover:border-white/25 hover:bg-white/[0.04]">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					{selected?.logoUrl ? (
						<img
							src={selected.logoUrl}
							alt=""
							className="h-5 w-auto shrink-0 object-contain"
						/>
					) : null}
					<span className={selected ? "text-white" : "text-white/40"}>
						{selected ? selected.label : placeholder}
					</span>
				</div>
				<span className="text-xs text-white/45">▾</span>
			</button>

			{open ? (
				<div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-md border border-white/10 bg-[#090909] shadow-2xl">
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => {
								onChange(option.value);
								setOpen(false);
							}}
							className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5 ${option.value === value ? "bg-white/[0.06]" : ""}`}>
							{option.logoUrl ? (
								<img
									src={option.logoUrl}
									alt=""
									className="h-5 w-auto shrink-0 object-contain opacity-80"
								/>
							) : null}
							<div className="min-w-0 flex-1">
								<div className="text-sm font-medium text-white">
									{option.label}
								</div>
								{option.description ? (
									<div className="mt-0.5 text-xs text-white/45">
										{option.description}
									</div>
								) : null}
							</div>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

/**
 * Renders Fancy Date Field
 * @param {{ label?: string, value?: string, onChange: (value: string) => void, placeholder?: string }} props Date Props
 * @returns {JSX.Element} Date Field View
 */

export function FancyDateField({
	label,
	value,
	onChange,
	placeholder = "Choisir une date",
}) {
	const [open, setOpen] = useState(false);
	const [monthCursor, setMonthCursor] = useState(() => {
		const base = value ? new Date(`${value}T00:00:00`) : new Date();
		return { year: base.getFullYear(), month: base.getMonth() };
	});
	const rootRef = useRef(null);
	const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
	const days = useMemo(
		() => buildCalendarMatrix(monthCursor.year, monthCursor.month),
		[monthCursor],
	);

	useEffect(() => {
		/**
		 * Handles Outside Click
		 * @param {MouseEvent} event Browser Event
		 * @returns {void} Nothing
		 */

		function onPointerDown(event) {
			if (rootRef.current && !rootRef.current.contains(event.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	/**
	 * Selects One Date
	 * @param {Date} date Selected Day
	 * @returns {void} Nothing
	 */

	function selectDate(date) {
		const iso = date.toISOString().slice(0, 10);
		onChange(iso);
		setOpen(false);
	}

	return (
		<div ref={rootRef} className="relative">
			{label ? (
				<span className="mb-2 block text-sm text-white/70">
					{label}
				</span>
			) : null}
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex h-12 w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-black/45 px-4 text-left text-white transition hover:border-white/25 hover:bg-white/[0.04]">
				<span className={selectedDate ? "text-white" : "text-white/40"}>
					{selectedDate ? formatDateValue(selectedDate) : placeholder}
				</span>
				<span className="text-xs text-white/45">📅</span>
			</button>

			{open ? (
				<div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[19rem] overflow-hidden rounded-md border border-white/10 bg-[#080808] shadow-2xl">
					<div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
						<button
							type="button"
							className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
							onClick={() =>
								setMonthCursor((prev) =>
									prev.month === 0
										? { year: prev.year - 1, month: 11 }
										: {
												year: prev.year,
												month: prev.month - 1,
											},
								)
							}>
							←
						</button>
						<div className="text-sm font-medium text-white">
							{new Date(
								monthCursor.year,
								monthCursor.month,
								1,
							).toLocaleDateString("fr-FR", {
								month: "long",
								year: "numeric",
							})}
						</div>
						<button
							type="button"
							className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
							onClick={() =>
								setMonthCursor((prev) =>
									prev.month === 11
										? { year: prev.year + 1, month: 0 }
										: {
												year: prev.year,
												month: prev.month + 1,
											},
								)
							}>
							→
						</button>
					</div>
					<div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/35">
						{["L", "M", "M", "J", "V", "S", "D"].map((day) => (
							<span key={day}>{day}</span>
						))}
					</div>
					<div className="grid grid-cols-7 gap-1 p-3">
						{days.map((date, index) =>
							date ? (
								<button
									key={index}
									type="button"
									onClick={() => selectDate(date)}
									className={`h-10 rounded-md border text-sm transition ${selectedDate && date.toDateString() === selectedDate.toDateString() ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.07]"}`}>
									{date.getDate()}
								</button>
							) : (
								<span key={index} className="h-10 rounded-xl" />
							),
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
