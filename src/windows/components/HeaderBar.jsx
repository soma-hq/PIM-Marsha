import React, { useState } from "react";

import { buildHeaderTabs } from "../utils/page/structures/pageStructure.jsx";
import {
	Bars3Icon,
	XMarkIcon,
	ChevronDownIcon,
	Cog6ToothIcon,
	ArrowRightOnRectangleIcon,
} from "../utils/icons.jsx";

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
	const [navOpen, setNavOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Mobile: burger button */}
				<button
					type="button"
					onClick={() => setNavOpen((prev) => !prev)}
					className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/70 hover:bg-white/5 md:hidden">
					{navOpen ? (
						<XMarkIcon className="h-5 w-5" />
					) : (
						<Bars3Icon className="h-5 w-5" />
					)}
				</button>

				{/* Desktop: tab nav */}
				<nav className="hidden items-center gap-2 md:flex">
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

				{/* User menu */}
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
								if (!event.currentTarget.dataset.fallback) {
									event.currentTarget.dataset.fallback = "1";
									event.currentTarget.src = "/logos/michou-logo.png";
								}
							}}
						/>
						<span className="hidden text-sm font-medium text-white/90 sm:block">
							{user?.name || "Utilisateur"}
						</span>
						<ChevronDownIcon className="h-3.5 w-3.5 text-white/45" />
					</button>

					{menuOpen ? (
						<div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-white/10 bg-black/95 shadow-2xl">
							<div className="border-b border-white/10 px-3 py-2 text-xs text-white/60">
								Connecté en tant que
								<div className="mt-1 text-sm text-white">
									{user?.email}
								</div>
							</div>
							<button
								type="button"
								onClick={onOpenProfile}
								className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10">
								<Cog6ToothIcon className="h-4 w-4 text-white/45" />
								Paramètres
							</button>
							<button
								type="button"
								onClick={onLogout}
								className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10">
								<ArrowRightOnRectangleIcon className="h-4 w-4 text-white/45" />
								Déconnexion
							</button>
						</div>
					) : null}
				</div>
			</div>

			{/* Mobile nav dropdown */}
			{navOpen ? (
				<nav className="border-t border-white/10 bg-black/95 px-4 py-2 md:hidden">
					{tabs.map((tab) => {
						const active = tab.key === activeTab;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => {
									onTabChange(tab.key);
									setNavOpen(false);
								}}
								className={`block w-full rounded-md px-4 py-3 text-left text-sm transition ${
									active
										? "bg-white/10 font-semibold text-white"
										: "text-white/65 hover:bg-white/5 hover:text-white"
								}`}>
								{tab.label}
							</button>
						);
					})}
				</nav>
			) : null}
		</header>
	);
}
