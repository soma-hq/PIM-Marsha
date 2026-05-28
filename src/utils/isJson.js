/**
 * Checks JSON String
 * @param {unknown} value Input Value
 * @returns {boolean} Parse Result
 */

module.exports = function isJson(value) {
	if (typeof value !== "string") return false;

	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
};
