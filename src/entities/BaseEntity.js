module.exports = class BaseEntity {
	constructor(database) {
		this.database = database;
		this.sequelize = database.connector;
	}

	get models() {
		return this.database.models;
	}

	get tableName() {
		throw new Error("tableName getter must be implemented");
	}

	async load() {
		throw new Error("load() must be implemented");
	}

	associate() {}
};
