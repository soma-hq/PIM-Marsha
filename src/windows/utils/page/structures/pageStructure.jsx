import React from "react";

import {
	canAccessAdminTabs,
	hasMinRole,
	normalizeRole,
	requireAuthenticated,
} from "./security.jsx";

/**
 * Creates Page Definition
 * @param {{ key: string, requiresAuth?: boolean, minRole?: string|null }} definition Raw Definition
 * @returns {{ key: string, requiresAuth: boolean, minRole: string|null }} Final Definition
 */

export function createPageStructure(definition) {
	return {
		...definition,
		requiresAuth: definition.requiresAuth ?? true,
		minRole: definition.minRole || null,
	};
}

/**
 * Checks Page Visibility
 * @param {{ requiresAuth: boolean, minRole: string|null }} page Page Definition
 * @param {{ role?: string }|null|undefined} user Current User
 * @returns {boolean} Render Permission
 */

export function canRenderPage(page, user) {
	if (!page.requiresAuth) return true;
	requireAuthenticated(user);
	if (!page.minRole) return true;
	return hasMinRole(user.role, page.minRole);
}

/**
 * Builds Header Tabs
 * @param {{ role?: string }|null|undefined} user Current User
 * @returns {Array<{ key: string, label: string }>} Tabs List
 */

export function buildHeaderTabs(user) {
	const role = normalizeRole(user?.role);
	const commonTabs = [
		{ key: "home", label: "Accueil" },
		{ key: "organizations", label: "Organisation" },
		{ key: "sessions", label: "Sessions" },
	];

	if (canAccessAdminTabs(role)) {
		commonTabs.push({ key: "admin", label: "Admin" });
	}

	return commonTabs;
}

/**
 * Wraps Page With Security
 * @template P
 * @param {React.ComponentType<P>} PageComponent Base Component
 * @param {{ requiresAuth: boolean, minRole: string|null }} page Page Definition
 * @returns {React.FC<P & { user?: { role?: string } }>} Wrapped Component
 */

export function withSecurityBoundary(PageComponent, page) {
	return function SecuredPage(props) {
		const { user } = props;
		if (!canRenderPage(page, user)) {
			return (
				<div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
					Accès refusé pour cette section.
				</div>
			);
		}

		return <PageComponent {...props} />;
	};
}
