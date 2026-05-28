const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorFeedEventsEntity extends BaseEntity {
	get tableName() {
		return "junior_feed_events";
	}

	async load() {
		this.sequelize.define(
			this.tableName,
			{
				juniorId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "junior_id",
				},
				feedEventId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "feed_event_id",
				},
			},
			{ tableName: "junior_feed_events" },
		);
	}
};
