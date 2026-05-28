// Role names used in middleware and frontend
const ROLES = {
	MEMBRE: "membre",
	REFERENT: "referent",
	RESPONSABLE: "responsable",
	SUPER_ADMIN: "super_admin",
	OWNER: "owner",
};

// Page type identifiers
const PAGE_TYPES = {
	NOTES_GENERALES: "notes_generales",
	REMARQUES: "remarques",
	FORMATIONS: "formations",
	PRELUDE: "prelude",
};

// Feed event type identifiers
const EVENT_TYPE = {
	LIVE_MULTI: "live_multi",
	ENTREVUE_RRJ: "entrevue_rrj",
	ENTREVUE_RJ: "entrevue_rj",
	ATELIER: "atelier",
};

// Timeline source identifiers
const TIMELINE_SOURCE = {
	PLANNED: "planned",
	RESPONSABLE: "responsable",
	REFERENT: "referent",
};

// Audit log action type strings
const AUDIT_ACTION = {
	LOGIN: "LOGIN",
	LOGOUT: "LOGOUT",
	PROFILE_UPDATE: "PROFILE_UPDATE",
	SESSION_REVOKE_ALL: "SESSION_REVOKE_ALL",
	USER_CREATE: "USER_CREATE",
	USER_UPDATE: "USER_UPDATE",
	USER_DELETE: "USER_DELETE",
	ORGANIZATION_CREATE: "ORGANIZATION_CREATE",
	ORGANIZATION_UPDATE: "ORGANIZATION_UPDATE",
	ORGANIZATION_DELETE: "ORGANIZATION_DELETE",
	PIM_CREATE: "PIM_CREATE",
	PIM_UPDATE: "PIM_UPDATE",
	PIM_DELETE: "PIM_DELETE",
};

// Resource type identifiers for audit logs
const RESOURCE = {
	AUTH: "auth",
	USER: "user",
	ORGANIZATION: "organization",
	PIM: "pim",
};

// Training category identifiers
const TRAINING_CATEGORY = {
	OBLIGATOIRE: "obligatoire",
	PERFECTIONNEMENT: "perfectionnement",
};

// Valid PIM type enum values
const PIM_TYPES = ["PIMD", "PIMY", "PIMT", "PIMP"];

// Valid junior periodicity enum values
const PERIODICITIES = ["1ere_periode", "2eme_periode", "periode_bonus"];

// Express route path prefixes
const ROUTES = {
	API: "/api",
	ASSETS: "/assets",
	LOGOS: "/logos",
	BUNDLE: "/bundle.js",
};

// Filesystem paths
const PATHS = {
	ENTITIES: "../entities",
	PUBLIC_ASSETS: "public/assets",
	PUBLIC_LOGOS: "public/logos",
	WINDOWS_BUNDLE: "src/windows/dist/bundle.js",
	WINDOWS_ROOT: "src/windows",
};

// Authentication string constants
const AUTH = {
	BEARER_PREFIX: "Bearer ",
	HEADER: "authorization",
	COOKIE_PATH: "/",
};

// Security response header map
const SECURITY_HEADERS = {
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "geolocation=(), microphone=()",
};

// Database table names, column names, and enum type names
const DB = {
	TABLES: {
		USERS: "users",
		PIMS: "pims",
		JUNIORS: "juniors",
		FEED_EVENTS: "feed_events",
		AUDIT_LOGS: "audit_logs",
	},
	COLUMNS: {
		MUST_CHANGE_PASSWORD: "must_change_password",
		IS_ACTIVE: "is_active",
		LAST_LOGIN_AT: "last_login_at",
		SESSION_VERSION: "session_version",
		DISCORD_ID: "discord_id",
		PERIODICITY: "periodicity",
		PERIOD_VALIDATED: "period_validated",
		TIMELINE_SOURCE: "timeline_source",
		TYPE: "type",
	},
	ENUMS: {
		PIM_TYPE: "enum_pims_type",
		PERIODICITY: "enum_juniors_periodicity",
		TIMELINE_SOURCE: "enum_feed_events_timeline_source",
	},
	EXCLUDE_FILES: ["index.js", "BaseEntity.js"],
};

// Application service label
const SERVICE_NAME = "pim-marsha-api";

// Password strength validation pattern
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

module.exports = {
	ROLES,
	PAGE_TYPES,
	EVENT_TYPE,
	TIMELINE_SOURCE,
	AUDIT_ACTION,
	RESOURCE,
	TRAINING_CATEGORY,
	PIM_TYPES,
	PERIODICITIES,
	ROUTES,
	PATHS,
	AUTH,
	SECURITY_HEADERS,
	DB,
	SERVICE_NAME,
	PASSWORD_REGEX,
};
