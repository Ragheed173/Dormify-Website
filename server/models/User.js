const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 120],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "uq_users_email",
        msg: "Email must be unique",
      },
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 30],
      },
    },
    role: {
      type: DataTypes.ENUM("student", "admin", "owner"),
      defaultValue: "student",
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    password_change_token_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    password_change_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ["password_change_token_hash", "password_change_token_expires"],
      },
    },
  },
);

module.exports = User;
