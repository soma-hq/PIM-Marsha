const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class NotesEntity extends BaseEntity {
	get tableName() {
		return "notes";
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
				authorId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "author_id",
				},
			},
			{ tableName: "notes" },
		);
	}

	associate(models) {
		models.notes.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
		models.notes.belongsTo(models.users, {
			foreignKey: "author_id",
			as: "author",
		});
		models.notes.belongsToMany(models.juniors, {
			through: models.junior_notes,
			foreignKey: "note_id",
			otherKey: "junior_id",
			as: "juniors",
		});
	}
};
