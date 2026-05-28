const { Sequelize } = require("sequelize");
const {
	DB,
	PIM_TYPES,
	PERIODICITIES,
	TIMELINE_SOURCE,
} = require("../utils/constants");

/**
 * Ensures user table mandatory columns exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize query interface
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<boolean>} True when user table is reachable
 */

async function ensureUsersColumns(queryInterface, logger) {
	let usersTable;
	try {
		usersTable = await queryInterface.describeTable(DB.TABLES.USERS);
	} catch {
		return false;
	}

	if (!usersTable[DB.COLUMNS.MUST_CHANGE_PASSWORD]) {
		await queryInterface.addColumn(
			DB.TABLES.USERS,
			DB.COLUMNS.MUST_CHANGE_PASSWORD,
			{
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		);
		logger.info("Added users.must_change_password column");
	}

	if (!usersTable[DB.COLUMNS.IS_ACTIVE]) {
		await queryInterface.addColumn(DB.TABLES.USERS, DB.COLUMNS.IS_ACTIVE, {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		});
		logger.info("Added users.is_active column");
	}

	if (!usersTable[DB.COLUMNS.LAST_LOGIN_AT]) {
		await queryInterface.addColumn(
			DB.TABLES.USERS,
			DB.COLUMNS.LAST_LOGIN_AT,
			{
				type: Sequelize.DATE,
				allowNull: true,
			},
		);
		logger.info("Added users.last_login_at column");
	}

	if (!usersTable[DB.COLUMNS.SESSION_VERSION]) {
		await queryInterface.addColumn(
			DB.TABLES.USERS,
			DB.COLUMNS.SESSION_VERSION,
			{
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		);
		logger.info("Added users.session_version column");
	}

	return true;
}

/**
 * Ensures PIM table extra columns exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize query interface
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<void>} Nothing
 */

async function ensurePimsColumns(queryInterface, logger) {
	let pimsTable;
	try {
		pimsTable = await queryInterface.describeTable(DB.TABLES.PIMS);
	} catch {
		return;
	}

	if (pimsTable && !pimsTable[DB.COLUMNS.TYPE]) {
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${DB.ENUMS.PIM_TYPE}') THEN CREATE TYPE "${DB.ENUMS.PIM_TYPE}" AS ENUM (${PIM_TYPES.map((t) => `'${t}'`).join(", ")}); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn(DB.TABLES.PIMS, DB.COLUMNS.TYPE, {
			type: Sequelize.ENUM(...PIM_TYPES),
			allowNull: true,
		});
		logger.info("Added pims.type column");
	}
}

/**
 * Ensures junior table extra columns exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize query interface
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<void>} Nothing
 */

async function ensureJuniorsColumns(queryInterface, logger) {
	let juniorsTable;
	try {
		juniorsTable = await queryInterface.describeTable(DB.TABLES.JUNIORS);
	} catch {
		return;
	}

	if (juniorsTable && !juniorsTable[DB.COLUMNS.DISCORD_ID]) {
		await queryInterface.addColumn(
			DB.TABLES.JUNIORS,
			DB.COLUMNS.DISCORD_ID,
			{
				type: Sequelize.STRING,
				allowNull: true,
			},
		);
		logger.info("Added juniors.discord_id column");
	}

	if (juniorsTable && !juniorsTable[DB.COLUMNS.PERIODICITY]) {
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${DB.ENUMS.PERIODICITY}') THEN CREATE TYPE "${DB.ENUMS.PERIODICITY}" AS ENUM (${PERIODICITIES.map((p) => `'${p}'`).join(", ")}); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn(
			DB.TABLES.JUNIORS,
			DB.COLUMNS.PERIODICITY,
			{
				type: Sequelize.ENUM(...PERIODICITIES),
				allowNull: true,
			},
		);
		logger.info("Added juniors.periodicity column");
	}

	if (juniorsTable && !juniorsTable[DB.COLUMNS.PERIOD_VALIDATED]) {
		await queryInterface.addColumn(
			DB.TABLES.JUNIORS,
			DB.COLUMNS.PERIOD_VALIDATED,
			{
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		);
		logger.info("Added juniors.period_validated column");
	}
}

/**
 * Ensures feed event table extra columns exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize query interface
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<void>} Nothing
 */

async function ensureFeedEventsColumns(queryInterface, logger) {
	let feedEventsTable;
	try {
		feedEventsTable = await queryInterface.describeTable(
			DB.TABLES.FEED_EVENTS,
		);
	} catch {
		return;
	}

	if (feedEventsTable && !feedEventsTable[DB.COLUMNS.TIMELINE_SOURCE]) {
		const tlValues = Object.values(TIMELINE_SOURCE);
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${DB.ENUMS.TIMELINE_SOURCE}') THEN CREATE TYPE "${DB.ENUMS.TIMELINE_SOURCE}" AS ENUM (${tlValues.map((v) => `'${v}'`).join(", ")}); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn(
			DB.TABLES.FEED_EVENTS,
			DB.COLUMNS.TIMELINE_SOURCE,
			{
				type: Sequelize.ENUM(...tlValues),
				allowNull: false,
				defaultValue: TIMELINE_SOURCE.REFERENT,
			},
		);
		logger.info("Added feed_events.timeline_source column");
	}
}

/**
 * Ensures the audit log table exists, creating it when absent
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize query interface
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<void>} Nothing
 */

async function ensureAuditLogsTable(queryInterface, logger) {
	let exists = true;
	try {
		await queryInterface.describeTable(DB.TABLES.AUDIT_LOGS);
	} catch {
		exists = false;
	}
	if (exists) return;

	await queryInterface.createTable(DB.TABLES.AUDIT_LOGS, {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		actor_id: { type: Sequelize.UUID, allowNull: true },
		actor_email: { type: Sequelize.STRING, allowNull: true },
		action_type: { type: Sequelize.STRING, allowNull: false },
		resource_type: { type: Sequelize.STRING, allowNull: false },
		resource_id: { type: Sequelize.STRING, allowNull: true },
		status: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "SUCCESS",
		},
		metadata: { type: Sequelize.JSONB, allowNull: true },
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
		updated_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
	});
	logger.info("Created audit_logs table");
}

/**
 * Runs all runtime schema upgrades in a safe sequence
 * @param {import("sequelize").Sequelize} connector Sequelize connector
 * @param {{ info: Function }} logger Logger instance
 * @returns {Promise<void>} Nothing
 */

async function runSchemaUpgrades(connector, logger) {
	const queryInterface = connector.getQueryInterface();
	const hasUsers = await ensureUsersColumns(queryInterface, logger);
	if (!hasUsers) return;

	await ensurePimsColumns(queryInterface, logger);
	await ensureJuniorsColumns(queryInterface, logger);
	await ensureFeedEventsColumns(queryInterface, logger);
	await ensureAuditLogsTable(queryInterface, logger);
}

module.exports = {
	runSchemaUpgrades,
};
