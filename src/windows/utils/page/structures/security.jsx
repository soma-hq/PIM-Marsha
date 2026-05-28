export const ROLE_RANK = ["membre", "referent", "responsable", "super_admin"];

/**
 * Normalizes Role Value
 * @param {string|null|undefined} role Raw Role
 * @returns {string} Normalized Role
 */

export function normalizeRole(role) {
	return String(role || "").toLowerCase();
}

/**
 * Checks Minimum Role
 * @param {string|null|undefined} userRole User Role
 * @param {string|null|undefined} requiredRole Required Role
 * @returns {boolean} Access Result
 */

export function hasMinRole(userRole, requiredRole) {
	const userIndex = ROLE_RANK.indexOf(normalizeRole(userRole));
	const requiredIndex = ROLE_RANK.indexOf(normalizeRole(requiredRole));
	if (userIndex === -1 || requiredIndex === -1) return false;
	return userIndex >= requiredIndex;
}

/**
 * Checks Admin Access
 * @param {string|null|undefined} userRole User Role
 * @returns {boolean} Access Result
 */

export function canAccessAdminTabs(userRole) {
	return hasMinRole(userRole, "responsable");
}

/**
 * Ensures Auth Context
 * @param {any} user Current User
 * @returns {true} Validation Flag
 */

export function requireAuthenticated(user) {
	if (!user) {
		throw new Error("Session requise");
	}
	return true;
}
