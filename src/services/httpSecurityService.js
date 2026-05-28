/**
 * Parses The CORS Origin Configuration Into A Clean Allow List

 * @param {string|null|undefined} corsOrigin Comma Separated Origins

 * @returns {string[]} Normalized Allowed Origins */

function parseAllowedOrigins(corsOrigin) {
	return String(corsOrigin || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

/**
 * Applies Security Headers To The Current Response

 * @param {import("express").Response} res Express Response Instance

 * @returns {void} Nothing */

function applySecurityHeaders(res) {
	// basic hardening
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
}

/**
 * Builds A CORS Origin Resolver Callback

 * @param {string[]} allowedOrigins Allowed Origin Values

 * @returns {(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => void} CORS Origin Resolver */

function buildCorsOriginResolver(allowedOrigins) {
	/**
 * Resolves A Single Origin Against The Allow List

 * @param {string|undefined} origin Current Request Origin

 * @param {(error: Error | null, allow?: boolean) => void} callback CORS Callback

 * @returns {void} Nothing	 */

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
