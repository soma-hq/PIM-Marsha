const config = require("../config");

const ORDERED_ROLES = config.roles;

/**
 * Checks Role Rank
 * @param {string} userRole User Role
 * @param {string} requiredRole Required Role
 * @returns {boolean} Access Result
 */

function hasMinimumRole(userRole, requiredRole) {
	return (
		ORDERED_ROLES.indexOf(userRole) >= ORDERED_ROLES.indexOf(requiredRole)
	);
}

/**
 * Creates RBAC Middleware
 * @param {string} role Required Role
 * @returns {(req: any, res: any, next: Function) => any} Express Middleware
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
