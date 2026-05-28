const jwt = require("jsonwebtoken");

/**
 * Builds The Authentication Middleware
 * @param {{ config: any, database: any }} app Application Container
 * @returns {import("express").RequestHandler} Express Middleware
 */

module.exports = function auth(app) {
	/**
	 * Validates Token, Account State, And Session Version
	 * @param {import("express").Request} req Express Request
	 * @param {import("express").Response} res Express Response
	 * @param {import("express").NextFunction} next Express Next Callback
	 * @returns {Promise<void|import("express").Response>} Middleware Completion
	 */

	return async (req, res, next) => {
		const header = req.headers.authorization || "";
		const bearerToken = header.startsWith("Bearer ")
			? header.slice(7)
			: null;
		const cookieToken = req.cookies?.[app.config.cookie.name] || null;
		const token = bearerToken || cookieToken;

		// Auth gate
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

			// Auth context
			req.auth = payload;
			req.authUser = user;
			return next();
		} catch {
			return res.status(401).json({ message: "Token invalide" });
		}
	};
};
