const config = require("../config");

const ORDERED_ROLES = config.roles;

/**
 * Checks whether a user meets the minimum role rank
 * @param {string} userRole Current user role
 * @param {string} requiredRole Minimum required role
 * @returns {boolean} True when rank is sufficient
 */

function hasMinimumRole(userRole, requiredRole) {
	return (
		ORDERED_ROLES.indexOf(userRole) >= ORDERED_ROLES.indexOf(requiredRole)
	);
}

/**
 * Creates RBAC middleware requiring a minimum role
 * @param {string} role Minimum required role
 * @returns {(req: any, res: any, next: Function) => any} Express middleware
 */

module.exports = function requireRole(role) {
	return (req, res, next) => {
		const userRole = req.auth?.role;

		if (!userRole)
			return res
				.status(401)
				.json({ message: "Utilisateur non authentifié" });
		if (!hasMinimumRole(userRole, role))
			return res.status(403).json({ message: "Accès refusé" });

		return next();
	};
};
