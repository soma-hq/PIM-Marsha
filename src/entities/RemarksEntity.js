const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class RemarksEntity extends BaseEntity {
	get tableName() {
		return "remarks";
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
				content: { type: DataTypes.TEXT, allowNull: false },
				scope: {
					type: DataTypes.ENUM("general", "junior"),
					allowNull: false,
					defaultValue: "general",
				},
				priority: {
					type: DataTypes.ENUM("low", "medium", "high", "critical"),
					allowNull: false,
					defaultValue: "medium",
				},
				authorId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "author_id",
				},
			},
			{ tableName: "remarks" },
		);
	}

	associate(models) {
		models.remarks.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.remarks.belongsTo(models.users, {
			foreignKey: "author_id",
			as: "author",
		});
		models.remarks.belongsToMany(models.juniors, {
			through: models.junior_remarks,
			foreignKey: "remark_id",
			otherKey: "junior_id",
			as: "juniors",
		});
	}
};
