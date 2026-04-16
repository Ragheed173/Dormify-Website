const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "rejected"),
    defaultValue: "pending",
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "bookings",
  timestamps: true,
});

module.exports = Booking;