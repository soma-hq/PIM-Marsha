import React, { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../utils/icons.jsx";

// Home Page Component
const SOURCE_CONFIG = [
	{
		key: "inoxtag",
		title: "Activité Inoxtag",
		logo: "/logos/customers/inoxtag-logo.png",
		matchers: ["inox", "inoxtag"],
	},
	{
		key: "doig",
		title: "Activité Doig",
		logo: "/logos/customers/doig-logo.png",
		matchers: ["doig"],
	},
	{
		key: "michou",
		title: "Activité Michou",
		logo: "/logos/customers/michou-logo.png",
		matchers: ["michou"],
	},
	{
		key: "marsha",
		title: "Activité Générale",
		logo: "/logos/marsha-logo.png",
		matchers: [],
	},
];

/**
 * Resolves The Activity Source Key From An Item Payload
 * @param {{ label?: string, meta?: string } | null | undefined} item Activity Item
 * @returns {string} Source Key
 */

function resolveSource(item) {
	// Source infer
	const haystack = `${item?.label || ""} ${item?.meta || ""}`.toLowerCase();
	for (const source of SOURCE_CONFIG) {
		if (source.key === "marsha") continue;
		if (source.matchers.some((matcher) => haystack.includes(matcher))) {
			return source.key;
		}
	}
	return "marsha";
}

/**
 * Renders The Home Dashboard Screen
 * @param {{ pims: any[], logs: any[], activity: any[], user: any }} props Component Props
 * @returns {JSX.Element} Home Page View
 */

export function HomePage({ pims, logs, activity, user }) {
	// Ui state
	const [expanded, setExpanded] = useState({});
	const recentLogs = logs || [];
	const recentActivity = activity || [];
	const activePims = (pims || []).slice(0, 6);

	// Grouped feed
	const groupedActivities = useMemo(() => {
		const base = Object.fromEntries(
			SOURCE_CONFIG.map((source) => [source.key, []]),
		);
		const merged =
			recentActivity.length > 0
				? recentActivity.map((item) => ({
						id:
							item.id ||
							item.createdAt ||
							Math.random().toString(36),
						label: item.label,
						meta: item.meta,
						createdAt: item.createdAt,
					}))
				: recentLogs.map((log) => ({
						id: log.id,
						label: log.actionType,
						meta: log.actorEmail || "Système",
						createdAt: log.createdAt,
					}));

		for (const item of merged) {
			const key = resolveSource(item);
			base[key].push(item);
		}

		return SOURCE_CONFIG.map((source) => ({
			...source,
			items: base[source.key].slice(0, 30),
		}));
	}, [recentActivity, recentLogs]);

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex items-center gap-3 px-4 py-3">
				<img
					src={user?.avatarUrl || "/logos/michou-logo.png"}
					alt={user?.name || "Avatar"}
					className="h-11 w-11 rounded-full object-cover"
					onError={(event) => {
						if (!event.currentTarget.dataset.fallback) {
							event.currentTarget.dataset.fallback = "1";
							event.currentTarget.src = "/logos/michou-logo.png";
						}
					}}
				/>
				<p className="text-lg font-semibold text-white">
					Bienvenue {user?.name || "utilisateur"}
				</p>
			</div>

			<div className="space-y-3 rounded-md border border-white/10 bg-[#090909] p-5">
				<h2 className="text-2xl font-semibold">Activités récentes</h2>
				{groupedActivities.map((group) => {
					if (!group.items.length) return null;
					const isExpanded = Boolean(expanded[group.key]);
					const visibleItems = isExpanded
						? group.items
						: group.items.slice(0, 4);
					return (
						<div
							key={group.key}
							className="rounded-md border border-white/10 bg-black/35 p-4">
							<div className="mb-3 flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<img
										src={group.logo}
										alt={group.title}
										className="h-7 w-auto object-contain"
									/>
									<h3 className="text-base font-semibold text-white">
										{group.title}
									</h3>
								</div>
								{group.items.length > 4 ? (
									<button
										type="button"
										onClick={() =>
											setExpanded((prev) => ({
												...prev,
												[group.key]: !isExpanded,
											}))
										}
										className="flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/75 hover:bg-white/5">
										{isExpanded ? (
											<ChevronUpIcon className="h-3.5 w-3.5" />
										) : (
											<ChevronDownIcon className="h-3.5 w-3.5" />
										)}
										{isExpanded
											? "Voir moins"
											: "Voir plus"}
									</button>
								) : null}
							</div>
							<div className="space-y-2">
								{visibleItems.map((item) => (
									<div
										key={item.id}
										className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
										<p className="font-medium text-white">
											{item.label}
										</p>
										{item.meta ? (
											<p className="text-xs text-white/45">
												{item.meta}
											</p>
										) : null}
										<p className="text-xs text-white/40">
											{new Date(
												item.createdAt,
											).toLocaleString("fr-FR")}
										</p>
									</div>
								))}
							</div>
						</div>
					);
				})}
				{groupedActivities.every(
					(group) => group.items.length === 0,
				) ? (
					<p className="text-sm text-white/60">
						Aucune activité récente.
					</p>
				) : null}
			</div>

			<div className="mx-auto w-full max-w-4xl rounded-md border border-white/10 bg-white/[0.03] p-5">
				<div className="mb-4 flex items-center justify-between gap-3">
					<h3 className="text-xl font-semibold">Sessions en cours</h3>
					<span className="text-xs text-white/45">
						{activePims.length} affichées
					</span>
				</div>
				<div className="space-y-3">
					{activePims.map((pim) => (
						<div
							key={pim.id}
							className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
							<div className="flex items-center justify-between gap-2">
								<p className="font-semibold text-white">
									{pim.title}
								</p>
								<span className="rounded-md border border-white/15 px-2 py-0.5 text-xs text-white/70">
									{pim.code}
								</span>
							</div>
							<p className="mt-2 text-sm text-white/55">
								{pim.confidentialityText ||
									"Aucune note de confidentialité"}
							</p>
						</div>
					))}
					{activePims.length === 0 ? (
						<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">
							Aucune session configurée pour le moment.
						</p>
					) : null}
				</div>
			</div>
		</section>
	);
}
