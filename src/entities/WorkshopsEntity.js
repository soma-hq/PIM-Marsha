const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class WorkshopsEntity extends BaseEntity {
	get tableName() {
		return "workshops";
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
				completedAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "completed_at",
				},
				responsableId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "responsable_id",
				},
			},
			{ tableName: "workshops" },
		);
	}

	associate(models) {
		models.workshops.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.workshops.belongsTo(models.users, {
			foreignKey: "responsable_id",
			as: "responsable",
		});
		models.workshops.belongsToMany(models.juniors, {
			through: models.junior_workshops,
			foreignKey: "workshop_id",
			otherKey: "junior_id",
			as: "juniors",
		});
	}
};
