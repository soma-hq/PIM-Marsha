const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class OrganizationsEntity extends BaseEntity {
	get tableName() {
		return "organizations";
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
				name: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				logoKey: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "logo_key",
				},
			},
			{ tableName: "organizations" },
		);
	}

	associate(models) {
		models.organizations.hasMany(models.users, {
			foreignKey: "organization_id",
			as: "users",
		});
		models.organizations.hasMany(models.pims, {
			foreignKey: "organization_id",
			as: "pims",
		});
	}
};
