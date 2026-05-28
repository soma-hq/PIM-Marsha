const TIMELINE_SOURCES = ["planned", "responsable", "referent"];

/**
 * Normalizes A Timeline Source Value
 * @param {string|null|undefined} value Timeline Source Candidate
 * @returns {"planned"|"responsable"|"referent"|null} Normalized Source Or Null
 */

function normalizeTimelineSource(value) {
	const source = String(value || "")
		.trim()
		.toLowerCase();
	return TIMELINE_SOURCES.includes(source) ? source : null;
}

/**
 * Resolves A Timeline Source From Input Or Actor Role
 * @param {string|null|undefined} preferredSource Preferred Source Value
 * @param {string|null|undefined} actorRole Actor Role Used As Fallback
 * @returns {"planned"|"responsable"|"referent"} Resolved Timeline Source
 */

function resolveTimelineSource(preferredSource, actorRole) {
	const normalized = normalizeTimelineSource(preferredSource);
	if (normalized) return normalized;
	const role = String(actorRole || "")
		.trim()
		.toLowerCase();
	if (["responsable", "super_admin"].includes(role)) return "responsable";
	return "referent";
}

module.exports = {
	TIMELINE_SOURCES,
	normalizeTimelineSource,
	resolveTimelineSource,
};
