const path = require("path");
const dotenv = require("dotenv");

const databaseDefaults = require("./configurations/dabatabase.default.json");
const rolesDefaults = require("./configurations/roles.default.json");
const organizationsDefaults = require("./configurations/organizations.default.json");
const usersDefaults = require("./configurations/users.default.json");
const redisDefaults = require("./configurations/redis.default.json");
const serverDefaults = require("./configurations/server.default.json");
const apiDefaults = require("./configurations/api.default.json");
const securityDefaults = require("./configurations/security.default.json");
const pimConfigDefaults = require("./configurations/pim.default.json");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = process.env.NODE_ENV || "development";
const configuredJwtSecret = process.env.JWT_SECRET || "unsafe-dev-secret";

if (env === "production" && configuredJwtSecret === "unsafe-dev-secret") {
	throw new Error(
		"JWT_SECRET must be explicitly set in production environment",
	);
}

module.exports = {
	env,
	port: Number(serverDefaults.port || 3000),
	jwtSecret: configuredJwtSecret,
	corsOrigin: process.env.CORS_ORIGIN || serverDefaults.corsOrigins,
	cookie: {
		name: process.env.COOKIE_NAME || "pim_session",
		httpOnly: serverDefaults.cookieHttpOnly,
		sameSite: process.env.COOKIE_SAMESITE || serverDefaults.cookieSameSite,
		secure:
			String(
				process.env.COOKIE_SECURE || env === "production",
			).toLowerCase() === "true",
		maxAge: Number(
			process.env.COOKIE_MAX_AGE_MS || serverDefaults.cookieMaxAgeMs,
		),
	},
	database: {
		enabled:
			String(
				process.env.DB_ENABLED || databaseDefaults.enabled,
			).toLowerCase() === "true",
		username: process.env.DB_USER || databaseDefaults.username,
		password: process.env.DB_PASSWORD ?? databaseDefaults.password,
		db: process.env.DB_NAME || databaseDefaults.db,
		port: Number(process.env.DB_PORT || databaseDefaults.port),
		dialect: process.env.DB_DIALECT || databaseDefaults.dialect,
		host: process.env.DB_HOST || databaseDefaults.host,
		ttl: Number(process.env.DB_TTL || databaseDefaults.ttl),
		pool: {
			max: Number(process.env.DB_POOL_MAX || databaseDefaults.pool.max),
			connectionTimeout: Number(
				process.env.DB_CONNECTION_TIMEOUT ||
					databaseDefaults.pool.connectionTimeout,
			),
			maxIdle: Number(
				process.env.DB_MAX_IDLE || databaseDefaults.pool.maxIdle,
			),
		},
		schema: {
			prefix:
				process.env.DB_SCHEMA_PREFIX || databaseDefaults.schema.prefix,
		},
		synchronize: {
			status:
				String(
					process.env.DB_SYNC || databaseDefaults.synchronize.status,
				).toLowerCase() === "true",
			event:
				process.env.DB_SYNC_EVENT || databaseDefaults.synchronize.event,
		},
	},
	redis: {
		enabled:
			String(
				process.env.REDIS_ENABLED || redisDefaults.enabled,
			).toLowerCase() === "true",
		prefix: process.env.REDIS_PREFIX || redisDefaults.prefix,
		host: process.env.REDIS_HOST || redisDefaults.host,
		port: Number(process.env.REDIS_PORT || redisDefaults.port),
		password:
			process.env.REDIS_PASSWORD ?? redisDefaults.password ?? undefined,
		db: Number(process.env.REDIS_DB || redisDefaults.db),
		connectionTimeoutMs: Number(
			process.env.REDIS_CONNECTION_TIMEOUT_MS ||
				redisDefaults.connectionTimeoutMs,
		),
		heartbeatIntervalMs: Number(
			process.env.REDIS_HEARTBEAT_INTERVAL_MS ||
				redisDefaults.heartbeatIntervalMs,
		),
		retryBaseMs: Number(
			process.env.REDIS_RETRY_BASE_MS || redisDefaults.retryBaseMs,
		),
		retryCapMs: Number(
			process.env.REDIS_RETRY_CAP_MS || redisDefaults.retryCapMs,
		),
		maxRetriesPerRequest: Number(
			process.env.REDIS_MAX_RETRIES_PER_REQUEST ||
				redisDefaults.maxRetriesPerRequest,
		),
		commandTimeoutMs: Number(
			process.env.REDIS_COMMAND_TIMEOUT_MS ||
				redisDefaults.commandTimeoutMs,
		),
		scanCount: Number(
			process.env.REDIS_SCAN_COUNT || redisDefaults.scanCount,
		),
	},
	api: {
		payloadLimit: process.env.API_PAYLOAD_LIMIT || apiDefaults.payloadLimit,
		sessionsLimit: Number(
			process.env.API_SESSIONS_LIMIT || apiDefaults.sessionsLimit,
		),
		auditLogsLimit: Number(
			process.env.API_AUDIT_LOGS_LIMIT || apiDefaults.auditLogsLimit,
		),
		defaultUserPassword:
			process.env.DEFAULT_USER_PASSWORD ||
			apiDefaults.defaultUserPassword,
		defaultUserRole:
			process.env.DEFAULT_USER_ROLE || apiDefaults.defaultUserRole,
		activityRecentJuniorsLimit: Number(
			process.env.API_ACTIVITY_JUNIORS_LIMIT ||
				apiDefaults.activityRecentJuniorsLimit,
		),
		activityRecentEventsLimit: Number(
			process.env.API_ACTIVITY_EVENTS_LIMIT ||
				apiDefaults.activityRecentEventsLimit,
		),
		activityRecentPimsLimit: Number(
			process.env.API_ACTIVITY_PIMS_LIMIT ||
				apiDefaults.activityRecentPimsLimit,
		),
		activityTotalLimit: Number(
			process.env.API_ACTIVITY_TOTAL_LIMIT ||
				apiDefaults.activityTotalLimit,
		),
	},
	security: {
		bcryptRounds: Number(
			process.env.BCRYPT_ROUNDS || securityDefaults.bcryptRounds,
		),
		jwtExpiry: process.env.JWT_EXPIRY || securityDefaults.jwtExpiry,
	},
	pim: {
		templateEventDescription: pimConfigDefaults.templateEventDescription,
		templateEventBaseDate: pimConfigDefaults.templateEventBaseDate,
		juniorDefaultStatus: pimConfigDefaults.juniorDefaultStatus,
		templateEventDurationMs: Number(
			process.env.PIM_TEMPLATE_EVENT_DURATION_MS ||
				pimConfigDefaults.templateEventDurationMs,
		),
	},
	roles: rolesDefaults.roles,
	organizations: organizationsDefaults.organizations,
	users: usersDefaults.users,
};
