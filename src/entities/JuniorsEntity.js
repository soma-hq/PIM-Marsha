const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorsEntity extends BaseEntity {
	get tableName() {
		return "juniors";
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
				firstName: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "first_name",
				},
				lastName: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "last_name",
				},
				displayName: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "display_name",
				},
				status: {
					type: DataTypes.ENUM(
						"non_debutee",
						"stand_by",
						"en_cours",
						"annulee",
						"achevee",
					),
					allowNull: false,
					defaultValue: "non_debutee",
				},
				referentId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "referent_id",
				},
				dispositif: {
					type: DataTypes.ENUM("PULSE", "ATRIA"),
					allowNull: false,
				},
				startDate: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					field: "start_date",
				},
				discordId: {
					type: DataTypes.STRING,
					allowNull: true,
					field: "discord_id",
				},
				periodicity: {
					type: DataTypes.ENUM(
						"1ere_periode",
						"2eme_periode",
						"periode_bonus",
					),
					allowNull: true,
				},
				periodValidated: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: "period_validated",
				},
			},
			{ tableName: "juniors" },
		);
	}

	associate(models) {
		models.juniors.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.juniors.belongsTo(models.users, {
			foreignKey: "referent_id",
			as: "referent",
		});

		models.juniors.belongsToMany(models.feed_events, {
			through: models.junior_feed_events,
			foreignKey: "junior_id",
			otherKey: "feed_event_id",
			as: "feedEvents",
		});
		models.juniors.belongsToMany(models.notes, {
			through: models.junior_notes,
			foreignKey: "junior_id",
			otherKey: "note_id",
			as: "notes",
		});
		models.juniors.belongsToMany(models.remarks, {
			through: models.junior_remarks,
			foreignKey: "junior_id",
			otherKey: "remark_id",
			as: "remarks",
		});
		models.juniors.belongsToMany(models.trainings, {
			through: models.junior_trainings,
			foreignKey: "junior_id",
			otherKey: "training_id",
			as: "trainings",
		});
		models.juniors.belongsToMany(models.workshops, {
			through: models.junior_workshops,
			foreignKey: "junior_id",
			otherKey: "workshop_id",
			as: "workshops",
		});
	}
};
