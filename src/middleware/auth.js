const jwt = require("jsonwebtoken");
const { AUTH } = require("../utils/constants");

/**
 * Builds the authentication middleware
 * @param {{ config: any, database: any }} app Application container
 * @returns {import("express").RequestHandler} Express middleware
 */

module.exports = function auth(app) {
	return async (req, res, next) => {
		const header = req.headers[AUTH.HEADER] || "";
		const bearerToken = header.startsWith(AUTH.BEARER_PREFIX)
			? header.slice(AUTH.BEARER_PREFIX.length)
			: null;
		const cookieToken = req.cookies?.[app.config.cookie.name] || null;
		const token = bearerToken || cookieToken;

		if (!token) return res.status(401).json({ message: "Token manquant" });

		try {
			const payload = jwt.verify(token, app.config.jwtSecret);
			if (payload.role) payload.role = String(payload.role).toLowerCase();

			const user = await app.database.models.users.findByPk(payload.sub);
			if (!user)
				return res.status(401).json({ message: "Token invalide" });
			if (user.isActive === false) {
				return res.status(403).json({ message: "Compte inactif" });
			}

			const tokenVersion = Number(payload.sessionVersion || 0);
			const currentVersion = Number(user.sessionVersion || 0);
			if (tokenVersion !== currentVersion) {
				return res.status(401).json({ message: "Session expiree" });
			}

			req.auth = payload;
			req.authUser = user;
			return next();
		} catch {
			return res.status(401).json({ message: "Token invalide" });
		}
	};
};
