const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class PagesEntity extends BaseEntity {
	get tableName() {
		return "pages";
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
				slug: { type: DataTypes.STRING, allowNull: false },
				type: {
					type: DataTypes.ENUM(
						"notes_generales",
						"remarques",
						"formations",
						"prelude",
						"custom",
					),
					allowNull: false,
					defaultValue: "custom",
				},
				content: { type: DataTypes.TEXT, allowNull: true },
				isRequired: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: "is_required",
				},
				position: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
			},
			{
				tableName: "pages",
				indexes: [{ unique: true, fields: ["pim_id", "slug"] }],
			},
		);
	}

	associate(models) {
		models.pages.belongsTo(models.pims, {
			foreignKey: "pim_id",
			as: "pim",
		});
	}
};
