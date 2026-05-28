import React, { useEffect, useMemo, useState } from "react";

import { HeaderBar } from "../components/HeaderBar.jsx";
import {
	authMe,
	logout,
	apiRequest,
	fetchAdminLogs,
	fetchMySessions,
} from "../utils/api/client.jsx";
import { fetchActivity } from "../utils/api/client.jsx";
import {
	createPageStructure,
	withSecurityBoundary,
} from "../utils/page/structures/pageStructure.jsx";
import { ForcePasswordModal } from "../components/ForcePasswordModal.jsx";

import { LoginPage } from "./LoginPage.jsx";
import { HomePage } from "./HomePage.jsx";
import { OrganizationsPage } from "./OrganizationsPage.jsx";
import { SessionsPage } from "./SessionsPage.jsx";
import { AdminPage } from "./AdminPage.jsx";
import { SettingsPage } from "./SettingsPage.jsx";
import { ErrorPage } from "./ErrorPage.jsx";

const pageDefinitions = {
	home: createPageStructure({ key: "home", minRole: "membre" }),
	organizations: createPageStructure({
		key: "organizations",
		minRole: "responsable",
	}),
	settings: createPageStructure({ key: "settings", minRole: "membre" }),
	sessions: createPageStructure({ key: "sessions", minRole: "membre" }),
	admin: createPageStructure({ key: "admin", minRole: "responsable" }),
};

const SecuredHomePage = withSecurityBoundary(HomePage, pageDefinitions.home);
const SecuredOrganizationsPage = withSecurityBoundary(
	OrganizationsPage,
	pageDefinitions.organizations,
);
const SecuredSessionsPage = withSecurityBoundary(
	SessionsPage,
	pageDefinitions.sessions,
);
const SecuredAdminPage = withSecurityBoundary(AdminPage, pageDefinitions.admin);
const SecuredSettingsPage = withSecurityBoundary(
	SettingsPage,
	pageDefinitions.settings,
);

/**
 * Renders Main Application
 * @returns {JSX.Element} Application View
 */

export function App() {
	// Auth state
	const [user, setUser] = useState(null);
	const [ready, setReady] = useState(false);
	const [transitioning, setTransitioning] = useState(false);
	const [transitionLogs, setTransitionLogs] = useState([]);
	const [activeTab, setActiveTab] = useState("home");
	const [organizations, setOrganizations] = useState([]);
	const [users, setUsers] = useState([]);
	const [pims, setPims] = useState([]);
	const [events, setEvents] = useState([]);
	const [logs, setLogs] = useState([]);
	const [activity, setActivity] = useState([]);
	const [sessionsPayload, setSessionsPayload] = useState(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [error, setError] = useState("");
	const [pageLoading, setPageLoading] = useState(false);
	const [reloadTick, setReloadTick] = useState(0);

	const isAuthenticated = Boolean(user);

	useEffect(() => {
		// Restore session
		let mounted = true;
		(async () => {
			try {
				const payload = await authMe();
				if (mounted) setUser(payload.user);
			} catch {
				if (mounted) setUser(null);
			} finally {
				if (mounted) setReady(true);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (!isAuthenticated) return;

		// Page data hydration
		let mounted = true;
		(async () => {
			setPageLoading(true);
			setError("");
			try {
				const role = String(user.role || "").toLowerCase();
				const canReadAdminLogs = [
					"super_admin",
					"responsable",
				].includes(role);

				const [pimsRes, eventsRes, activityRes] = await Promise.all([
					apiRequest("/pims"),
					apiRequest("/feed-events"),
					fetchActivity(),
				]);
				const sessionsRes = await fetchMySessions();
				const logsRes = canReadAdminLogs
					? await fetchAdminLogs("all")
					: { logs: [] };
				if (!mounted) return;
				setPims(pimsRes.pims || []);
				setEvents(eventsRes.events || []);
				setLogs(logsRes.logs || []);
				setActivity(activityRes.activities || []);
				setSessionsPayload(sessionsRes);

				if (["super_admin", "responsable"].includes(role)) {
					const [orgRes, usersRes] = await Promise.all([
						apiRequest("/organizations"),
						apiRequest("/users"),
					]);
					if (!mounted) return;
					setOrganizations(orgRes.organizations || []);
					setUsers(usersRes.users || []);
				}
			} catch (fetchError) {
				if (!mounted) return;
				setError(
					fetchError.message || "Impossible de charger les données.",
				);
			} finally {
				if (mounted) setPageLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated, user, reloadTick]);

	const pageNode = useMemo(() => {
		// Route render
		switch (activeTab) {
			case "organizations":
				return (
					<SecuredOrganizationsPage
						user={user}
						organizations={organizations}
						pims={pims}
					/>
				);
			case "sessions":
				return (
					<SecuredSessionsPage
						user={user}
						pims={pims}
						events={events}
						organizations={organizations}
						users={users}
					/>
				);
			case "admin":
				return (
					<SecuredAdminPage
						user={user}
						users={users}
						onUserCreated={(savedUser) => {
							setUsers((prev) => {
								const exists = prev.some(
									(item) => item.id === savedUser.id,
								);
								if (exists) {
									return prev.map((item) =>
										item.id === savedUser.id
											? { ...item, ...savedUser }
											: item,
									);
								}
								return [savedUser, ...prev];
							});
						}}
					/>
				);
			case "settings":
				return (
					<SecuredSettingsPage
						user={user}
						sessionsPayload={sessionsPayload}
						onUserUpdated={(updatedUser) => setUser(updatedUser)}
						onSecurityChanged={async () => {
							await onLogout();
						}}
					/>
				);
			case "home":
			default:
				return (
					<SecuredHomePage
						user={user}
						pims={pims}
						logs={logs}
						activity={activity}
					/>
				);
		}
	}, [
		activeTab,
		user,
		organizations,
		pims,
		events,
		users,
		logs,
		sessionsPayload,
	]);

	/**
	 * Resets Local Session
	 * @returns {Promise<void>} Async Done
	 */

	async function onLogout() {
		// Local reset
		try {
			await logout();
		} catch {
			// Ignore logout errors and force cleanup
		}
		setUser(null);
		setActiveTab("home");
		setOrganizations([]);
		setUsers([]);
		setPims([]);
		setEvents([]);
		setLogs([]);
		setActivity([]);
		setSessionsPayload(null);
		setMenuOpen(false);
		setError("");
	}

	if (!ready) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black text-white">
				<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/70">
					<img
						src="/logos/loader.gif"
						alt="Chargement"
						className="h-6 w-6 rounded-full"
					/>
					Chargement de la session...
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<LoginPage
				onLoginSuccess={(nextUser) => {
					setError("");
					// Start Termius-style transition
					setTransitioning(true);
					setTransitionLogs([]);
					const steps = [
						{ delay: 0, msg: "Authentification réussie." },
						{ delay: 600, msg: "Établissement de la session..." },
						{ delay: 1200, msg: "Chargement des organisations..." },
						{ delay: 1900, msg: "Chargement des PIM actives..." },
						{ delay: 2700, msg: "Chargement des événements..." },
						{ delay: 3500, msg: "Synchronisation des données..." },
						{ delay: 4300, msg: "Connexion établie." },
					];
					steps.forEach(({ delay, msg }) => {
						setTimeout(() => {
							setTransitionLogs((prev) => [
								...prev,
								{
									ts: new Date().toLocaleTimeString("fr-FR"),
									msg,
									ok: msg === "Connexion établie.",
								},
							]);
						}, delay);
					});
					setTimeout(() => {
						setTransitioning(false);
						setUser(nextUser);
					}, 5000);
				}}
			/>
		);
	}

	if (transitioning) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white">
				<img
					src="/logos/loader.gif"
					alt="Connexion"
					className="h-14 w-14 rounded-full"
				/>
				<div className="w-full max-w-md rounded-md border border-cyan-400/30 bg-[linear-gradient(160deg,#061224,#070d17)] px-5 py-4 font-mono text-xs shadow-[0_16px_40px_rgba(2,18,40,0.45)]">
					<p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
						Console d'accès — Connexion en cours
					</p>
					<div className="space-y-1">
						{transitionLogs.map((log, i) => (
							<div
								key={i}
								className={`flex gap-2 ${log.ok ? "text-emerald-300" : "text-cyan-200/80"}`}>
								<span className="text-white/30">
									[{log.ts}]
								</span>
								<span>{log.ok ? "✓" : "›"}</span>
								<span>{log.msg}</span>
							</div>
						))}
						{transitionLogs.length < 7 && (
							<div className="flex gap-2 text-cyan-200/40">
								<span className="animate-pulse">▋</span>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<HeaderBar
				user={user}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onOpenProfile={() => {
					setActiveTab("settings");
					setMenuOpen(false);
				}}
				onLogout={onLogout}
				menuOpen={menuOpen}
				onToggleMenu={() => setMenuOpen((prev) => !prev)}
			/>
			{pageLoading ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
					<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-sm text-white/80">
						<img
							src="/logos/loader.gif"
							alt="Chargement"
							className="h-6 w-6 rounded-full"
						/>
						Chargement des pages...
					</div>
				</div>
			) : null}
			{error ? (
				<ErrorPage
					message={error}
					onRetry={() => {
						setReloadTick((prev) => prev + 1);
					}}
				/>
			) : (
				pageNode
			)}
			{user?.mustChangePassword ? (
				<ForcePasswordModal
					onCompleted={(updatedUser) => {
						setUser(updatedUser);
					}}
				/>
			) : null}
		</div>
	);
}
