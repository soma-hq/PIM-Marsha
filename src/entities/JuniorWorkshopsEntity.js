const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorWorkshopsEntity extends BaseEntity {
	get tableName() {
		return "junior_workshops";
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
				workshopId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "workshop_id",
				},
			},
			{ tableName: "junior_workshops" },
		);
	}
};
