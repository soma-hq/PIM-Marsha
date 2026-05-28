const { ROLES } = require("../utils/constants");

const ALLOWED_ROLES = [
	ROLES.MEMBRE,
	ROLES.REFERENT,
	ROLES.RESPONSABLE,
	ROLES.SUPER_ADMIN,
];

/**
 * Normalizes a role input value to lowercase
 * @param {string|null|undefined} role Raw role value
 * @returns {string} Normalized lowercase role
 */

function normalizeInputRole(role) {
	return String(role || "")
		.trim()
		.toLowerCase();
}

/**
 * Converts an input role to its database format
 * @param {string|null|undefined} role Raw role value
 * @returns {string|null} Uppercase database role or null when invalid
 */

function toDbRole(role) {
	const normalized = normalizeInputRole(role);
	if (!ALLOWED_ROLES.includes(normalized)) return null;
	return normalized.toUpperCase();
}

/**
 * Checks whether an actor is authorized to create a target role
 * @param {string|null|undefined} actorRole Actor role value
 * @param {string|null|undefined} targetRole Target role value
 * @returns {boolean} True when creation is authorized
 */

function canCreateTargetRole(actorRole, targetRole) {
	const actor = normalizeInputRole(actorRole);
	const target = normalizeInputRole(targetRole);
	if (!ALLOWED_ROLES.includes(target)) return false;
	if (actor === ROLES.RESPONSABLE) return target === ROLES.REFERENT;
	return [ROLES.SUPER_ADMIN, ROLES.OWNER].includes(actor);
}

module.exports = {
	ALLOWED_ROLES,
	normalizeInputRole,
	toDbRole,
	canCreateTargetRole,
};
