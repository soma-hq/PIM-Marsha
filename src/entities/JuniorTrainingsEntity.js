const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorTrainingsEntity extends BaseEntity {
	get tableName() {
		return "junior_trainings";
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
				trainingId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "training_id",
				},
				status: {
					type: DataTypes.ENUM("not_started", "in_progress", "done"),
					allowNull: false,
					defaultValue: "not_started",
				},
				completedAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "completed_at",
				},
			},
			{ tableName: "junior_trainings" },
		);
	}
};
