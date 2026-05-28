const path = require("path");
const dotenv = require("dotenv");

const databaseDefaults = require("./configurations/dabatabase.default.json");
const rolesDefaults = require("./configurations/roles.default.json");
const organizationsDefaults = require("./configurations/organizations.default.json");
const usersDefaults = require("./configurations/users.default.json");
const redisDefaults = require("./configurations/redis.default.json");
const serverDefaults = require("./configurations/server.default.json");

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
	corsOrigin:
		process.env.CORS_ORIGIN ||
		"http://localhost:3000,http://127.0.0.1:3000",
	cookie: {
		name: process.env.COOKIE_NAME || "pim_session",
		httpOnly: true,
		sameSite: process.env.COOKIE_SAMESITE || "lax",
		secure:
			String(
				process.env.COOKIE_SECURE || env === "production",
			).toLowerCase() === "true",
		maxAge: Number(process.env.COOKIE_MAX_AGE_MS || 1000 * 60 * 60 * 12),
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
	},
	roles: rolesDefaults.roles,
	organizations: organizationsDefaults.organizations,
	users: usersDefaults.users,
};
