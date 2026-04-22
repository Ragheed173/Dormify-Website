const sequelize = require("../config/db");
const User = require("./User");
const Housing = require("./Housing");
const HousingImage = require("./HousingImage");
const Booking = require("./Booking");

User.hasMany(Booking, { foreignKey: "user_id", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Housing, { foreignKey: "owner_id", onDelete: "CASCADE" });
Housing.belongsTo(User, { foreignKey: "owner_id", as: "Owner" });

Housing.hasMany(Booking, { foreignKey: "housing_id", onDelete: "CASCADE" });
Booking.belongsTo(Housing, { foreignKey: "housing_id" });

Housing.hasMany(HousingImage, { foreignKey: "housing_id", onDelete: "CASCADE" });
HousingImage.belongsTo(Housing, { foreignKey: "housing_id" });

module.exports = {
  sequelize,
  User,
  Housing,
  HousingImage,
  Booking,
};