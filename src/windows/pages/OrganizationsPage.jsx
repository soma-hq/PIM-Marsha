import React, { useMemo } from "react";

const BANNERS_BY_LOGO = {
	"michou.png": "/assets/banners/michou-banner.jpeg",
	"doigby.png": "/assets/banners/doigby-banner.png",
	"inoxtag.png": "/assets/banners/inoxtag-banner.png",
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
 * Renders Organizations Page
 * @param {{ organizations: any[], pims: any[] }} props Page Props
 * @returns {JSX.Element} Page View
 */

export function OrganizationsPage({ organizations, pims }) {
	const pimsByOrg = useMemo(() => {
		const map = new Map();
		for (const pim of pims || []) {
			if (!pim.organizationId) continue;
			if (!map.has(pim.organizationId)) map.set(pim.organizationId, []);
			map.get(pim.organizationId).push(pim);
		}
		return map;
	}, [pims]);

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
						Chaque carte affiche sa bannière, son logo et les PIM en
						cours. Clique une organisation pour dérouler le détail.
					</p>
				</div>
				<div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
					{organizations.length} organisations
				</div>
			</div>

			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{organizations.map((org) => {
					const orgPims = pimsByOrg.get(org.id) || [];
					return (
						<article
							key={org.id}
							className="overflow-hidden rounded-md border border-white/10 bg-[#090909]">
							<img
								src={getBanner(org)}
								alt={`Bannière ${org.name}`}
								className="h-64 w-full object-cover object-left"
							/>
							<div className="space-y-3 p-4">
								<div className="flex items-center gap-3">
									<img
										src={`/logos/${org.logoKey}`}
										alt={org.name}
										className="h-10 w-10 rounded-md border border-white/10 object-cover"
										onError={(event) => {
											event.currentTarget.style.display =
												"none";
										}}
									/>
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
											className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
											<div className="font-medium text-white">
												{pim.title}
											</div>
											<div className="text-xs text-white/45">
												{pim.code}
											</div>
										</div>
									))}
									{orgPims.length === 0 ? (
										<p className="rounded-md border border-dashed border-white/10 px-3 py-3 text-sm text-white/45">
											Aucun PIM actif.
										</p>
									) : null}
								</div>
							</div>
						</article>
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
