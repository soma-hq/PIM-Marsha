const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class AuditLogsEntity extends BaseEntity {
	get tableName() {
		return "audit_logs";
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
				actorId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "actor_id",
				},
				actorEmail: {
					type: DataTypes.STRING,
					allowNull: true,
					field: "actor_email",
				},
				actionType: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "action_type",
				},
				resourceType: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "resource_type",
				},
				resourceId: {
					type: DataTypes.STRING,
					allowNull: true,
					field: "resource_id",
				},
				status: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: "SUCCESS",
				},
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
				},
			},
			{ tableName: "audit_logs" },
		);
	}

	associate(models) {
		models.audit_logs.belongsTo(models.users, {
			foreignKey: "actor_id",
			as: "actor",
		});
	}
};
