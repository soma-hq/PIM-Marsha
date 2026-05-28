const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class TrainingsEntity extends BaseEntity {
	get tableName() {
		return "trainings";
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
				description: { type: DataTypes.TEXT, allowNull: true },
				category: {
					type: DataTypes.ENUM("obligatoire", "perfectionnement"),
					allowNull: false,
					defaultValue: "obligatoire",
				},
				isRequired: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					field: "is_required",
				},
			},
			{ tableName: "trainings" },
		);
	}

	associate(models) {
		models.trainings.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.trainings.belongsToMany(models.juniors, {
			through: models.junior_trainings,
			foreignKey: "training_id",
			otherKey: "junior_id",
			as: "juniors",
		});
	}
};
