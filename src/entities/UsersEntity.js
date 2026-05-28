const { DataTypes } = require("sequelize");
const BaseEntity = require("./BaseEntity");

module.exports = class UsersEntity extends BaseEntity {
	get tableName() {
		return "users";
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
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: { isEmail: true },
				},
				name: { type: DataTypes.STRING, allowNull: false },
				firstName: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "first_name",
				},
				lastName: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "last_name",
				},
				avatarUrl: {
					type: DataTypes.STRING,
					allowNull: true,
					field: "avatar_url",
				},
				organizationId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "organization_id",
				},
				passwordHash: {
					type: DataTypes.STRING,
					allowNull: false,
					field: "password_hash",
				},
				mustChangePassword: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: "must_change_password",
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					field: "is_active",
				},
				lastLoginAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "last_login_at",
				},
				sessionVersion: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
					field: "session_version",
				},
				role: {
					type: DataTypes.ENUM(...this.database.app.config.roles),
					allowNull: false,
					defaultValue: this.database.app.config.roles[0],
				},
			},
			{ tableName: "users" },
		);
	}

	associate(models) {
		models.users.belongsTo(models.organizations, {
			foreignKey: "organization_id",
			as: "organization",
		});
		models.users.hasMany(models.juniors, {
			foreignKey: "referent_id",
			as: "referedJuniors",
		});
		models.users.hasMany(models.feed_events, {
			foreignKey: "responsable_id",
			as: "managedEvents",
		});
		models.users.hasMany(models.notes, {
			foreignKey: "author_id",
			as: "writtenNotes",
		});
		models.users.hasMany(models.remarks, {
			foreignKey: "author_id",
			as: "writtenRemarks",
		});
		models.users.hasMany(models.workshops, {
			foreignKey: "responsable_id",
			as: "managedWorkshops",
		});
	}
};
