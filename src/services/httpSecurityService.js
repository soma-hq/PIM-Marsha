const { SECURITY_HEADERS } = require("../utils/constants");

/**
 * Parses the CORS origin configuration into a clean allow list
 * @param {string|null|undefined} corsOrigin Comma-separated origins string
 * @returns {string[]} Normalized allowed origins
 */

function parseAllowedOrigins(corsOrigin) {
	return String(corsOrigin || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

/**
 * Applies security hardening headers to the current response
 * @param {import("express").Response} res Express response instance
 * @returns {void} Nothing
 */

function applySecurityHeaders(res) {
	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		res.setHeader(header, value);
	}
}

/**
 * Builds a CORS origin resolver callback from an allow list
 * @param {string[]} allowedOrigins Allowed origin values
 * @returns {(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => void} CORS origin resolver
 */

function buildCorsOriginResolver(allowedOrigins) {
	return function resolveOrigin(origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.length === 0) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error("Not allowed by CORS"));
	};
}

module.exports = {
	parseAllowedOrigins,
	applySecurityHeaders,
	buildCorsOriginResolver,
};
