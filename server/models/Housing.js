const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Housing = sequelize.define("Housing", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
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
  },
  status: {
    type: DataTypes.ENUM("available", "unavailable"),
    defaultValue: "available",
  },
}, {
  tableName: "housings",
  timestamps: true,
});

module.exports = Housing;