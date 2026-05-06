const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Housing = sequelize.define(
  "Housing",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 150],
      },
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 2000],
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 120],
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    gender_allowed: {
      type: DataTypes.ENUM("male", "female", "both"),
      defaultValue: "both",
    },
    room_type: {
      type: DataTypes.ENUM("single", "double", "triple"),
      allowNull: false,
    },
    available_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("available", "unavailable"),
      defaultValue: "available",
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "housings",
    timestamps: true,
    validate: {
      availableStatusRequiresRoom() {
        if (this.status === "available" && this.available_rooms <= 0) {
          throw new Error("available_rooms must be at least 1 when status is available");
        }
      },
    },
  }
);

module.exports = Housing;
