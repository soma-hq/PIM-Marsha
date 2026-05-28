const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class FeedEventsEntity extends BaseEntity {
	get tableName() {
		return "feed_events";
	}

	async load() {
		this.sequelize.define(
			this.tableName,
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				pimId: {
					type: DataTypes.UUID,
					allowNull: false,
					field: "pim_id",
				},
				title: { type: DataTypes.STRING, allowNull: false },
				eventType: {
					type: DataTypes.ENUM(
						"vocal",
						"vocal_bilan",
						"entrevue_rj",
						"entrevue_rrj",
						"live_youtube",
						"live_twitch",
						"live_multi",
						"formation",
						"atelier",
						"autre",
					),
					allowNull: false,
					defaultValue: "autre",
					field: "event_type",
				},
				description: { type: DataTypes.TEXT, allowNull: true },
				startAt: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "start_at",
				},
				endAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "end_at",
				},
				responsableId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "responsable_id",
				},
				timelineSource: {
					type: DataTypes.ENUM("planned", "responsable", "referent"),
					allowNull: false,
					defaultValue: "referent",
					field: "timeline_source",
				},
			},
			{ tableName: "feed_events" },
		);
	}

	associate(models) {
		models.feed_events.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.feed_events.belongsTo(models.users, {
			foreignKey: "responsable_id",
			as: "responsable",
		});

		models.feed_events.belongsToMany(models.juniors, {
			through: models.junior_feed_events,
			foreignKey: "feed_event_id",
			otherKey: "junior_id",
			as: "juniors",
		});
	}
};
