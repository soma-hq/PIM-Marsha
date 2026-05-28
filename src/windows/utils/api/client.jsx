/**
 * Executes A JSON API Request Against The Backend
 * @param {string} path Relative API Path
 * @param {RequestInit & { headers?: Record<string, string> }} [options={}] Fetch Options
 * @returns {Promise<any>} Parsed JSON Payload
 * @throws {Error} Throws When The HTTP Status Is Not Successful
 */

export async function apiRequest(path, options = {}) {
	const response = await fetch(`/api${path}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});

	const text = await response.text();
	const payload = text ? JSON.parse(text) : null;

	if (!response.ok) {
		throw new Error(payload?.message || `Erreur API ${response.status}`);
	}

	return payload;
}

/**
 * Fetches The Current Authenticated User
 * @returns {Promise<any>} Auth Payload
 */

export async function authMe() {
	return apiRequest("/auth/me");
}

/**
 * Performs Login With Email And Password
 * @param {{ email: string, password: string }} credentials Login Credentials
 * @returns {Promise<any>} Login Payload
 */

export async function login({ email, password }) {
	return apiRequest("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

/**
 * Logs Out The Current Session
 * @returns {Promise<any>} Logout Result
 */

export async function logout() {
	return apiRequest("/auth/logout", {
		method: "POST",
	});
}

/**
 * Updates The Current User Profile
 * @param {Record<string, any>} payload Profile Fields To Update
 * @returns {Promise<any>} Updated User Payload
 */

export async function updateMe(payload) {
	return apiRequest("/auth/me", {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

/**
 * Fetches Session History For The Current User
 * @returns {Promise<any>} Session List Payload
 */

export async function fetchMySessions() {
	return apiRequest("/auth/sessions");
}

/**
 * Revokes All Active Sessions For The Current User
 * @returns {Promise<any>} Revoke Result
 */

export async function revokeAllMySessions() {
	return apiRequest("/auth/sessions/revoke-all", {
		method: "POST",
	});
}

/**
 * Fetches Admin Logs With Optional Kind Filter
 * @param {string} [kind="all"] Log Filter Kind
 * @returns {Promise<any>} Admin Logs Payload
 */

export async function fetchAdminLogs(kind = "all") {
	const query = kind === "all" ? "" : `?kind=${encodeURIComponent(kind)}`;
	return apiRequest(`/admin/logs${query}`);
}

/**
 * Creates A New User Through Admin Endpoint
 * @param {Record<string, any>} payload User Creation Payload
 * @returns {Promise<any>} Created User Payload
 */

export async function createUser(payload) {
	return apiRequest("/users", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

/**
 * Updates A User Through Admin Endpoint
 * @param {string} id User Identifier
 * @param {Record<string, any>} payload Partial User Fields
 * @returns {Promise<any>} Updated User Payload
 */

export async function updateUserAdmin(id, payload) {
	return apiRequest(`/users/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

/**
 * Fetches All Users For Admin Screens
 * @returns {Promise<any>} Users Payload
 */

export async function fetchUsers() {
	return apiRequest("/users");
}

/**
 * Creates A New PIM Session
 * @param {Record<string, any>} payload PIM Creation Payload
 * @returns {Promise<any>} Created PIM Payload
 */

export async function createPim(payload) {
	return apiRequest("/pims", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

/**
 * Seeds Default Content For A PIM Session
 * @param {string} pimId PIM Identifier
 * @returns {Promise<any>} Seed Result Payload
 */

export async function seedPimDefaults(pimId) {
	return apiRequest(`/pims/${pimId}/seed-defaults`, {
		method: "POST",
	});
}

/**
 * Fetches Juniors For An Optional PIM
 * @param {string | null | undefined} pimId Optional PIM Identifier
 * @returns {Promise<any>} Juniors Payload
 */

export async function fetchJuniors(pimId) {
	const query = pimId ? `?pimId=${encodeURIComponent(pimId)}` : "";
	return apiRequest(`/juniors${query}`);
}

/**
 * Creates A Junior Entry
 * @param {Record<string, any>} payload Junior Creation Payload
 * @returns {Promise<any>} Created Junior Payload
 */

export async function createJunior(payload) {
	return apiRequest("/juniors", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

/**
 * Updates A Junior Entry
 * @param {string} id Junior Identifier
 * @param {Record<string, any>} payload Partial Junior Fields
 * @returns {Promise<any>} Updated Junior Payload
 */

export async function updateJunior(id, payload) {
	return apiRequest(`/juniors/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

/**
 * Deletes A Junior Entry
 * @param {string} id Junior Identifier
 * @returns {Promise<any>} Deletion Result Payload
 */

export async function deleteJunior(id) {
	return apiRequest(`/juniors/${id}`, { method: "DELETE" });
}

/**
 * Creates A Feed Event Entry
 * @param {Record<string, any>} payload Feed Event Payload
 * @returns {Promise<any>} Created Feed Event Payload
 */

export async function createFeedEvent(payload) {
	return apiRequest("/feed-events", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

/**
 * Fetches Notes For An Optional PIM
 * @param {string | null | undefined} pimId Optional PIM Identifier
 * @returns {Promise<any>} Notes Payload
 */

export async function fetchNotes(pimId) {
	const query = pimId ? `?pimId=${encodeURIComponent(pimId)}` : "";
	return apiRequest(`/notes${query}`);
}

/**
 * Creates A Note Entry
 * @param {Record<string, any>} payload Note Creation Payload
 * @returns {Promise<any>} Created Note Payload
 */

export async function createNote(payload) {
	return apiRequest("/notes", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

/**
 * Fetches Consolidated Activity Feed
 * @returns {Promise<any>} Activity Payload
 */

export async function fetchActivity() {
	return apiRequest("/activity");
}

/**
 * Fetches User Preferences
 * @returns {Promise<any>} Prefs Payload
 */

export async function fetchPrefs() {
	return apiRequest("/prefs");
}

/**
 * Updates User Preferences
 * @param {object} payload Prefs to update
 * @returns {Promise<any>} Updated Prefs
 */

export async function updatePrefs(payload) {
	return apiRequest("/prefs", { method: "PATCH", body: JSON.stringify(payload) });
}
