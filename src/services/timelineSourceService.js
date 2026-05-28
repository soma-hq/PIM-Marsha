const { TIMELINE_SOURCE, ROLES } = require("../utils/constants");

const TIMELINE_SOURCES = Object.values(TIMELINE_SOURCE);

/**
 * Normalizes a timeline source value
 * @param {string|null|undefined} value Timeline source candidate
 * @returns {"planned"|"responsable"|"referent"|null} Normalized source or null
 */

function normalizeTimelineSource(value) {
	const source = String(value || "")
		.trim()
		.toLowerCase();
	return TIMELINE_SOURCES.includes(source) ? source : null;
}

/**
 * Resolves a timeline source from input or actor role as fallback
 * @param {string|null|undefined} preferredSource Preferred source value
 * @param {string|null|undefined} actorRole Actor role used as fallback
 * @returns {"planned"|"responsable"|"referent"} Resolved timeline source
 */

function resolveTimelineSource(preferredSource, actorRole) {
	const normalized = normalizeTimelineSource(preferredSource);
	if (normalized) return normalized;
	const role = String(actorRole || "")
		.trim()
		.toLowerCase();
	if ([ROLES.RESPONSABLE, ROLES.SUPER_ADMIN].includes(role))
		return TIMELINE_SOURCE.RESPONSABLE;
	return TIMELINE_SOURCE.REFERENT;
}

module.exports = {
	TIMELINE_SOURCES,
	normalizeTimelineSource,
	resolveTimelineSource,
};
