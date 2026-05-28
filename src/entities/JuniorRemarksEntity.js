const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorRemarksEntity extends BaseEntity {
	get tableName() {
		return "junior_remarks";
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
				remarkId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "remark_id",
				},
			},
			{ tableName: "junior_remarks" },
		);
	}
};
