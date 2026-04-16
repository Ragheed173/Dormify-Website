const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HousingImage = sequelize.define("HousingImage", {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "housing_images",
  timestamps: true,
});

module.exports = HousingImage;