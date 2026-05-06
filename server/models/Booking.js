const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
    },
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
  validate: {
    endDateAfterStartDate() {
      if (this.start_date && this.end_date && this.end_date <= this.start_date) {
        throw new Error("end_date must be after start_date");
      }
    },
  },
});

module.exports = Booking;
