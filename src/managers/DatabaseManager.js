const fs = require("fs/promises");
const path = require("path");
const { Sequelize } = require("sequelize");
const { runSchemaUpgrades } = require("../services/schemaUpgradeService");

module.exports = class DatabaseManager {
	constructor(app) {
		this.app = app;

		this.connector = new Sequelize({
			username: this.config.username,
			password: this.config.password,
			database: this.config.db,
			port: this.config.port,
			dialect: this.config.dialect,
			host: this.config.host,
			pool: {
				min: 0,
				max: this.config.pool.max,
				acquire: this.config.pool.connectionTimeout,
				evict: this.config.pool.maxIdle,
			},
			logging: false,
			define: {
				timestamps: true,
				underscored: true,
			},
		});

		this.tables = new Map();
	}

	get models() {
		return this.connector.models;
	}

	get logger() {
		return this.app.logger;
	}

	get config() {
		return this.app.config.database;
	}

	get(table) {
		return this.tables.get(table);
	}

	async load() {
		await this.connector.authenticate();

		const modelsPath = path.join(__dirname, "../entities");
		const modelFiles = await fs.readdir(modelsPath);

		for (const file of modelFiles) {
			if (!file.endsWith(".js")) continue;
			if (file === "index.js") continue;
			if (file === "BaseEntity.js") continue;

			try {
				const EntityClass = require(path.join(modelsPath, file));
				const entity = new EntityClass(this);

				await entity.load();
				this.tables.set(entity.tableName, entity);
				this.logger.info(`Loaded ${entity.tableName} entity`);
			} catch (error) {
				this.logger.error(`Unable to load entity file ${file}`);
				this.logger.error(error);
			}
		}

		for (const entity of this.tables.values()) {
			if (typeof entity.associate === "function")
				entity.associate(this.models);
		}

		if (this.config.synchronize.status) {
			await this.connector.sync();
			this.logger.info("Database synchronized");
		}

		await this.ensureSchemaUpgrades();

		if (this.config.synchronize.status && this.app.redis) {
			await this.app.redis.subscribe(this.config.synchronize.event);
		}
	}

	async ensureSchemaUpgrades() {
		// schema sync
		await runSchemaUpgrades(this.connector, this.logger);
	}

	async listener(data) {
		if (!data?.table || !data?.type) return;

		this.logger.debug(
			`Sync message received for ${data.table} (${data.type})`,
		);
	}
};
