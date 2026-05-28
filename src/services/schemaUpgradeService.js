const { Sequelize } = require("sequelize");

/**
 * Ensures User Table Mandatory Columns Exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize Query Interface
 * @param {{ info: Function }} logger Logger Instance
 * @returns {Promise<boolean>} True When User Table Is Reachable
 */

async function ensureUsersColumns(queryInterface, logger) {
	let usersTable;
	try {
		usersTable = await queryInterface.describeTable("users");
	} catch {
		return false;
	}

	if (!usersTable.must_change_password) {
		await queryInterface.addColumn("users", "must_change_password", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
		logger.info("Added users.must_change_password column");
	}

	if (!usersTable.is_active) {
		await queryInterface.addColumn("users", "is_active", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		});
		logger.info("Added users.is_active column");
	}

	if (!usersTable.last_login_at) {
		await queryInterface.addColumn("users", "last_login_at", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		logger.info("Added users.last_login_at column");
	}

	if (!usersTable.session_version) {
		await queryInterface.addColumn("users", "session_version", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
		});
		logger.info("Added users.session_version column");
	}

	return true;
}

/**
 * Ensures PIM Table Extra Columns Exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize Query Interface
 * @param {{ info: Function }} logger Logger Instance
 * @returns {Promise<void>} Nothing
 */

async function ensurePimsColumns(queryInterface, logger) {
	let pimsTable;
	try {
		pimsTable = await queryInterface.describeTable("pims");
	} catch {
		return;
	}

	if (pimsTable && !pimsTable.type) {
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_pims_type') THEN CREATE TYPE "enum_pims_type" AS ENUM ('PIMD', 'PIMY', 'PIMT', 'PIMP'); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn("pims", "type", {
			type: Sequelize.ENUM("PIMD", "PIMY", "PIMT", "PIMP"),
			allowNull: true,
		});
		logger.info("Added pims.type column");
	}
}

/**
 * Ensures Junior Table Extra Columns Exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize Query Interface
 * @param {{ info: Function }} logger Logger Instance
 * @returns {Promise<void>} Nothing
 */

async function ensureJuniorsColumns(queryInterface, logger) {
	let juniorsTable;
	try {
		juniorsTable = await queryInterface.describeTable("juniors");
	} catch {
		return;
	}

	if (juniorsTable && !juniorsTable.discord_id) {
		await queryInterface.addColumn("juniors", "discord_id", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		logger.info("Added juniors.discord_id column");
	}

	if (juniorsTable && !juniorsTable.periodicity) {
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_juniors_periodicity') THEN CREATE TYPE "enum_juniors_periodicity" AS ENUM ('1ere_periode', '2eme_periode', 'periode_bonus'); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn("juniors", "periodicity", {
			type: Sequelize.ENUM(
				"1ere_periode",
				"2eme_periode",
				"periode_bonus",
			),
			allowNull: true,
		});
		logger.info("Added juniors.periodicity column");
	}

	if (juniorsTable && !juniorsTable.period_validated) {
		await queryInterface.addColumn("juniors", "period_validated", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
		logger.info("Added juniors.period_validated column");
	}
}

/**
 * Ensures Feed Event Table Extra Columns Exist
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize Query Interface
 * @param {{ info: Function }} logger Logger Instance
 * @returns {Promise<void>} Nothing
 */

async function ensureFeedEventsColumns(queryInterface, logger) {
	let feedEventsTable;
	try {
		feedEventsTable = await queryInterface.describeTable("feed_events");
	} catch {
		return;
	}

	if (feedEventsTable && !feedEventsTable.timeline_source) {
		try {
			await queryInterface.sequelize.query(
				`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feed_events_timeline_source') THEN CREATE TYPE "enum_feed_events_timeline_source" AS ENUM ('planned', 'responsable', 'referent'); END IF; END $$;`,
			);
		} catch {}
		await queryInterface.addColumn("feed_events", "timeline_source", {
			type: Sequelize.ENUM("planned", "responsable", "referent"),
			allowNull: false,
			defaultValue: "referent",
		});
		logger.info("Added feed_events.timeline_source column");
	}
}

/**
 * Ensures Audit Log Table Exists
 * @param {import("sequelize").QueryInterface} queryInterface Sequelize Query Interface
 * @param {{ info: Function }} logger Logger Instance
 * @returns {Promise<void>} Nothing
 */

async function ensureAuditLogsTable(queryInterface, logger) {
	let exists = true;
	try {
		await queryInterface.describeTable("audit_logs");
	} catch {
		exists = false;
	}
	if (exists) return;

	await queryInterface.createTable("audit_logs", {
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
 * Runs All Runtime Schema Upgrades In A Safe Sequence
 * @param {import("sequelize").Sequelize} connector Sequelize Connector
 * @param {{ info: Function }} logger Logger Instance
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
