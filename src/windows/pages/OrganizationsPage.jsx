import React, { useMemo, useState } from "react";

import {
	ArrowLeftIcon,
	PlusIcon,
	BuildingOfficeIcon,
} from "../utils/icons.jsx";

const BANNERS_BY_LOGO = {
	"michou.png": "/assets/banners/michou-banner.jpeg",
	"doigby.png": "/assets/banners/doigby-banner.png",
	"inoxtag.png": "/assets/banners/inoxtag-banner.png",
};

const CUSTOMER_LOGO_BY_KEY = {
	"michou.png": "/logos/customers/michou-logo.png",
	"doigby.png": "/logos/customers/doig-logo.png",
	"inoxtag.png": "/logos/customers/inoxtag-logo.png",
};

/**
 * Resolves Banner Path
 * @param {{ logoKey?: string }|null|undefined} org Organization Item
 * @returns {string} Banner Path
 */

function getBanner(org) {
	return (
		BANNERS_BY_LOGO[org?.logoKey] || "/assets/banners/michou-banner.jpeg"
	);
}

/**
 * Renders Org Detail Dashboard
 * @param {{ org: any, pims: any[], onBack: () => void, onCreateSession?: () => void }} props Detail Props
 * @returns {JSX.Element} Detail View
 */

function OrgDashboard({ org, pims, onBack, onCreateSession }) {
	const customerLogo = CUSTOMER_LOGO_BY_KEY[org.logoKey];

	return (
		<section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-start justify-between gap-4">
				<div className="flex items-center gap-4">
					{customerLogo ? (
						<img
							src={customerLogo}
							alt={org.name}
							className="h-10 w-auto object-contain"
							onError={(event) => {
								event.currentTarget.style.display = "none";
							}}
						/>
					) : (
						<BuildingOfficeIcon className="h-10 w-10 text-white/30" />
					)}
					<div>
						<h2 className="text-3xl font-semibold text-white">
							{org.name}
						</h2>
						<p className="mt-0.5 text-sm text-white/45">
							{pims.length} session
							{pims.length !== 1 ? "s" : ""} PIM
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onBack}
					className="flex shrink-0 items-center gap-1.5 text-sm text-white/50 hover:text-white">
					<ArrowLeftIcon className="h-4 w-4" />
					Retour
				</button>
			</div>

			{onCreateSession ? (
				<div className="mb-6 flex flex-wrap gap-3">
					<button
						type="button"
						onClick={onCreateSession}
						className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black">
						<PlusIcon className="h-4 w-4" />
						Créer une session
					</button>
				</div>
			) : null}

			<div className="space-y-3">
				<p className="text-xs uppercase tracking-[0.22em] text-white/35">
					Sessions PIM
				</p>

				{pims.length === 0 ? (
					<p className="py-6 text-sm text-white/45">
						Aucune session PIM associée à cette organisation.
					</p>
				) : null}

				{pims.map((pim) => (
					<div
						key={pim.id}
						className="rounded-md bg-white/[0.03] px-4 py-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="font-medium text-white">
									{pim.title}
								</p>
								<p className="text-xs text-white/45">
									{pim.code}
								</p>
							</div>
							{pim.status ? (
								<span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
									{pim.status}
								</span>
							) : null}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

/**
 * Renders Organizations Page
 * @param {{ organizations: any[], pims: any[], onNavigateToSessions?: () => void }} props Page Props
 * @returns {JSX.Element} Page View
 */

export function OrganizationsPage({
	organizations,
	pims,
	onNavigateToSessions,
}) {
	const [selectedOrg, setSelectedOrg] = useState(null);

	const pimsByOrg = useMemo(() => {
		const map = new Map();
		for (const pim of pims || []) {
			if (!pim.organizationId) continue;
			if (!map.has(pim.organizationId)) map.set(pim.organizationId, []);
			map.get(pim.organizationId).push(pim);
		}
		return map;
	}, [pims]);

	if (selectedOrg) {
		return (
			<OrgDashboard
				org={selectedOrg}
				pims={pimsByOrg.get(selectedOrg.id) || []}
				onBack={() => setSelectedOrg(null)}
				onCreateSession={
					onNavigateToSessions
						? () => onNavigateToSessions(selectedOrg.id)
						: undefined
				}
			/>
		);
	}

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.22em] text-white/35">
						Organisation
					</p>
					<h2 className="mt-2 text-3xl font-semibold">
						Cartographie des orga
					</h2>
					<p className="mt-2 max-w-2xl text-sm text-white/55">
						Clique sur une organisation pour afficher son tableau de
						bord.
					</p>
				</div>
				<p className="text-sm text-white/45">
					{organizations.length} organisations
				</p>
			</div>

			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{organizations.map((org) => {
					const orgPims = pimsByOrg.get(org.id) || [];
					const customerLogo = CUSTOMER_LOGO_BY_KEY[org.logoKey];
					return (
						<button
							key={org.id}
							type="button"
							onClick={() => setSelectedOrg(org)}
							className="overflow-hidden rounded-md bg-[#090909] text-left transition-colors hover:bg-white/[0.04]">
							<img
								src={getBanner(org)}
								alt={`Bannière ${org.name}`}
								className="h-64 w-full object-cover object-left"
							/>
							<div className="space-y-3 p-4">
								<div className="flex items-center gap-3">
									{customerLogo ? (
										<img
											src={customerLogo}
											alt={org.name}
											className="h-7 w-auto object-contain"
											onError={(event) => {
												event.currentTarget.style.display =
													"none";
											}}
										/>
									) : null}
									<h3 className="text-xl font-semibold text-white">
										{org.name}
									</h3>
								</div>
								<div className="space-y-2">
									<p className="text-xs uppercase tracking-[0.18em] text-white/40">
										PIM en cours
									</p>
									{orgPims.slice(0, 4).map((pim) => (
										<div
											key={pim.id}
											className="rounded-md bg-white/[0.03] px-3 py-2 text-sm">
											<div className="font-medium text-white">
												{pim.title}
											</div>
											<div className="text-xs text-white/45">
												{pim.code}
											</div>
										</div>
									))}
									{orgPims.length === 0 ? (
										<p className="py-2 text-sm text-white/45">
											Aucun PIM actif.
										</p>
									) : null}
								</div>
							</div>
						</button>
					);
				})}
				{organizations.length === 0 ? (
					<p className="text-sm text-white/60">
						Aucune organisation configurée.
					</p>
				) : null}
			</div>
		</section>
	);
}
