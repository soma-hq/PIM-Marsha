import React from "react";

import { buildHeaderTabs } from "../utils/page/structures/pageStructure.jsx";

/**
 * Renders Main Header
 * @param {{ user: any, activeTab: string, onTabChange: (tab: string) => void, onOpenProfile: () => void, onLogout: () => void, menuOpen: boolean, onToggleMenu: () => void }} props Header Props
 * @returns {JSX.Element} Header View
 */

export function HeaderBar({
	user,
	activeTab,
	onTabChange,
	onOpenProfile,
	onLogout,
	menuOpen,
	onToggleMenu,
}) {
	const tabs = buildHeaderTabs(user);

	return (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<nav className="flex items-center gap-3 overflow-x-auto">
					{tabs.map((tab) => {
						const active = tab.key === activeTab;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => onTabChange(tab.key)}
								className={`rounded-md border px-4 py-2 text-sm transition ${
									active
										? "border-white/20 bg-white text-black"
										: "border-transparent bg-white/[0.03] text-white/75 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
								}`}>
								{tab.label}
							</button>
						);
					})}
				</nav>

				<div className="relative">
					<button
						type="button"
						onClick={onToggleMenu}
						className="flex items-center gap-2 px-1 py-1 text-left">
						<img
							src={user?.avatarUrl || "/logos/michou-logo.png"}
							alt={user?.name || "Avatar"}
							className="h-8 w-8 rounded-full object-cover"
							onError={(event) => {
								event.currentTarget.src =
									"/logos/michou-logo.png";
							}}
						/>
						<span className="text-sm font-medium text-white/90">
							{user?.name || "Utilisateur"}
						</span>
					</button>

					{menuOpen ? (
						<div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-white/10 bg-black/95 shadow-2xl">
							<div className="border-b border-white/10 px-3 py-2 text-xs text-white/60">
								Connecte en tant que
								<div className="mt-1 text-sm text-white">
									{user?.email}
								</div>
							</div>
							<button
								type="button"
								onClick={onOpenProfile}
								className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10">
								Paramètres
							</button>
							<button
								type="button"
								onClick={onLogout}
								className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10">
								Déconnexion
							</button>
						</div>
					) : null}
				</div>
			</div>
		</header>
	);
}
