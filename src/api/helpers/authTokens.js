const jwt = require("jsonwebtoken");
const { AUTH } = require("../../utils/constants");

/**
 * Normalizes a role value to lowercase
 * @param {string|null|undefined} role Raw role
 * @returns {string} Normalized role
 */

function normalizeRole(role) {
	return String(role || "").toLowerCase();
}

/**
 * Builds the public-safe user shape
 * @param {any} user User record
 * @returns {object} Safe user payload
 */

function pickUser(user) {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		firstName: user.firstName,
		lastName: user.lastName,
		avatarUrl: user.avatarUrl,
		organizationId: user.organizationId,
		role: normalizeRole(user.role),
		mustChangePassword: Boolean(user.mustChangePassword),
		isActive: Boolean(user.isActive ?? true),
		lastLoginAt: user.lastLoginAt,
		sessionVersion: Number(user.sessionVersion || 0),
		createdAt: user.createdAt,
	};
}

/**
 * Signs a session JWT for the given user
 * @param {any} app App container
 * @param {any} user User record
 * @returns {string} Signed JWT
 */

function issueToken(app, user) {
	return jwt.sign(
		{
			sub: user.id,
			role: normalizeRole(user.role),
			email: user.email,
			sessionVersion: Number(user.sessionVersion || 0),
		},
		app.config.jwtSecret,
		{ expiresIn: app.config.security.jwtExpiry },
	);
}

/**
 * Sets the session cookie on the response
 * @param {any} app App container
 * @param {any} res Express response
 * @param {string} token Session token
 * @returns {void} Nothing
 */

function setSessionCookie(app, res, token) {
	res.cookie(app.config.cookie.name, token, {
		httpOnly: app.config.cookie.httpOnly,
		sameSite: app.config.cookie.sameSite,
		secure: app.config.cookie.secure,
		maxAge: app.config.cookie.maxAge,
		path: AUTH.COOKIE_PATH,
	});
}

/**
 * Clears the session cookie from the response
 * @param {any} app App container
 * @param {any} res Express response
 * @returns {void} Nothing
 */

function clearSessionCookie(app, res) {
	res.clearCookie(app.config.cookie.name, { path: AUTH.COOKIE_PATH });
}

module.exports = {
	pickUser,
	issueToken,
	setSessionCookie,
	clearSessionCookie,
};
