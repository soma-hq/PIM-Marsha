import React, { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDownIcon } from "../../utils/icons.jsx";

function FilterDropdown({
	options,
	value,
	onChange,
	placeholder,
	disabled = false,
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);

	const selected = useMemo(
		() => options.find((item) => item.value === value) || null,
		[options, value],
	);

	useEffect(() => {
		function onPointerDown(event) {
			if (rootRef.current && !rootRef.current.contains(event.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	return (
		<div ref={rootRef} className="relative w-full">
			<button
				type="button"
				disabled={disabled}
				onClick={() => setOpen((prev) => !prev)}
				className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm transition ${
					disabled
						? "cursor-not-allowed border-white/[0.06] bg-[#0a0a0a] text-white/20"
						: "border-white/15 bg-[#0d0d0d] text-white/80 hover:border-white/30 hover:bg-white/[0.04]"
				}`}>
				<span className="truncate">
					{selected?.label || placeholder || "Choisir"}
				</span>
				<ChevronDownIcon
					className={`h-4 w-4 shrink-0 text-white/45 transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open ? (
				<div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-40 overflow-hidden rounded-lg border border-white/10 bg-[#080808] shadow-2xl">
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => {
								onChange(option.value);
								setOpen(false);
							}}
							className={`w-full px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
								option.value === value
									? "bg-white/[0.08] text-white"
									: "text-white/72"
							}`}>
							{option.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

export function CascadeFilters({
	primaryOptions,
	primaryValue,
	onPrimaryChange,
	secondaryOptions = [],
	secondaryValue,
	onSecondaryChange,
	onApply,
	applyLabel = "Valider",
	canApply = true,
}) {
	const showSecondary = secondaryOptions.length > 0;

	return (
		<div className="relative max-w-full overflow-visible pb-1">
			<div className="flex flex-wrap items-center gap-3">
				<div className="w-60 shrink-0">
					<FilterDropdown
						options={primaryOptions}
						value={primaryValue}
						onChange={onPrimaryChange}
						placeholder="Filtre principal"
					/>
				</div>

				<div
					className={`overflow-hidden transition-[width,opacity,transform] duration-300 ease-out ${
						showSecondary
							? "w-60 opacity-100"
							: "w-0 -translate-x-3 opacity-0"
					}`}>
					<div className="w-60">
						<FilterDropdown
							options={secondaryOptions}
							value={secondaryValue}
							onChange={onSecondaryChange}
							placeholder="Filtre secondaire"
							disabled={!showSecondary}
						/>
					</div>
				</div>

				<div className="shrink-0">
					<button
						type="button"
						onClick={onApply}
						disabled={!canApply}
						className="h-10 rounded-lg border border-white/20 bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45">
						{applyLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
