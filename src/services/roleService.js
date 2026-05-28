const ALLOWED_ROLES = ["membre", "referent", "responsable", "super_admin"];

/**
 * Normalizes A Role Input Value
 * @param {string|null|undefined} role Raw Role Value
 * @returns {string} Normalized Lowercase Role
 */

function normalizeInputRole(role) {
	return String(role || "")
		.trim()
		.toLowerCase();
}

/**
 * Converts An Input Role To Database Format
 * @param {string|null|undefined} role Raw Role Value
 * @returns {string|null} Uppercase Database Role Or Null When Invalid
 */

function toDbRole(role) {
	const normalized = normalizeInputRole(role);
	if (!ALLOWED_ROLES.includes(normalized)) return null;
	return normalized.toUpperCase();
}

/**
 * Checks Whether An Actor Can Create A Target Role
 * @param {string|null|undefined} actorRole Actor Role Value
 * @param {string|null|undefined} targetRole Target Role Value
 * @returns {boolean} True When Creation Is Authorized
 */

function canCreateTargetRole(actorRole, targetRole) {
	const actor = normalizeInputRole(actorRole);
	const target = normalizeInputRole(targetRole);
	if (!ALLOWED_ROLES.includes(target)) return false;
	if (actor === "responsable") return target === "referent";
	return ["super_admin", "owner"].includes(actor) || actor === "responsable";
}

module.exports = {
	ALLOWED_ROLES,
	normalizeInputRole,
	toDbRole,
	canCreateTargetRole,
};
