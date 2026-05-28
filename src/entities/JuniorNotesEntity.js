const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class JuniorNotesEntity extends BaseEntity {
	get tableName() {
		return "junior_notes";
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
				noteId: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					field: "note_id",
				},
			},
			{ tableName: "junior_notes" },
		);
	}
};
