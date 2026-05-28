const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class PimsEntity extends BaseEntity {
	get tableName() {
		return "pims";
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
				organizationId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "organization_id",
				},
				title: { type: DataTypes.STRING, allowNull: false },
				code: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				confidentialityText: {
					type: DataTypes.TEXT,
					allowNull: false,
					defaultValue:
						"Session privée et confidentielle. Le partage externe est strictement interdit et peut entraîner une révocation immédiate.",
					field: "confidentiality_text",
				},
				startDate: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					field: "start_date",
				},
				endDate: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					field: "end_date",
				},
				isPrivate: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					field: "is_private",
				},
				type: {
					type: DataTypes.ENUM("PIMD", "PIMY", "PIMT", "PIMP"),
					allowNull: true,
					field: "type",
				},
			},
			{ tableName: "pims" },
		);
	}

	associate(models) {
		models.pims.hasMany(models.pages, {
			foreignKey: "pim_id",
			as: "pages",
		});
		models.pims.hasMany(models.juniors, {
			foreignKey: "pim_id",
			as: "juniors",
		});
		models.pims.hasMany(models.feed_events, {
			foreignKey: "pim_id",
			as: "feedEvents",
		});
		models.pims.belongsTo(models.organizations, {
			foreignKey: "organization_id",
			as: "organization",
		});
		models.pims.hasMany(models.notes, {
			foreignKey: "pim_id",
			as: "notes",
		});
		models.pims.hasMany(models.remarks, {
			foreignKey: "pim_id",
			as: "remarks",
		});
		models.pims.hasMany(models.trainings, {
			foreignKey: "pim_id",
			as: "trainings",
		});
		models.pims.hasMany(models.workshops, {
			foreignKey: "pim_id",
			as: "workshops",
		});
	}
};
