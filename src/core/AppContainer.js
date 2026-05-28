const config = require("../config");
const logger = require("./logger");
const DatabaseManager = require("../managers/DatabaseManager");
const RedisManager = require("../managers/RedisManager");

module.exports = class AppContainer {
	constructor() {
		// shared singletons
		this.config = config;
		this.logger = logger;
		this.redis = new RedisManager(this);
		this.database = new DatabaseManager(this);
	}

	async init() {
		// infra boot
		await this.redis.connect();
		await this.database.load();
	}
};
