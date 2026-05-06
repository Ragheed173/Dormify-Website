const { Booking, Housing, HousingImage, User, sequelize } = require("../models");
const AppError = require("../utils/AppError");

const bookingDetailsInclude = [
  {
    model: User,
    attributes: { exclude: ["password"] },
  },
  {
    model: Housing,
    include: [{ model: HousingImage }],
  },
];

const syncHousingAvailability = async (housing, transaction) => {
  housing.status = housing.available_rooms > 0 ? "available" : "unavailable";
  await housing.save({ transaction });
};

/**
 * Applies booking status changes and room inventory updates in one transaction.
 * This keeps admin, owner, and general booking flows consistent.
 */
const updateBookingStatusWithInventory = async ({
  bookingId,
  status,
  bookingWhere = {},
  housingWhere = undefined,
  notFoundMessage = "Booking not found",
}) => {
  let updatedBookingId;

  await sequelize.transaction(async (transaction) => {
    const housingInclude = {
      model: Housing,
      required: true,
    };

    if (housingWhere) {
      housingInclude.where = housingWhere;
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, ...bookingWhere },
      include: [housingInclude],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      throw new AppError(notFoundMessage, 404, "BOOKING_NOT_FOUND");
    }

    const housing = booking.Housing;
    const oldStatus = booking.status;

    if (oldStatus !== "confirmed" && status === "confirmed") {
      if (housing.status !== "available" || housing.available_rooms <= 0) {
        throw new AppError(
          "This housing is no longer available",
          400,
          "HOUSING_UNAVAILABLE"
        );
      }

      housing.available_rooms -= 1;
      await syncHousingAvailability(housing, transaction);
    }

    if (oldStatus === "confirmed" && status !== "confirmed") {
      housing.available_rooms += 1;
      await syncHousingAvailability(housing, transaction);
    }

    booking.status = status;
    await booking.save({ transaction });
    updatedBookingId = booking.id;
  });

  return Booking.findByPk(updatedBookingId, {
    include: bookingDetailsInclude,
  });
};

const deleteBookingWithInventory = async (bookingId) => {
  await sequelize.transaction(async (transaction) => {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Housing }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (booking.status === "confirmed" && booking.Housing) {
      booking.Housing.available_rooms += 1;
      await syncHousingAvailability(booking.Housing, transaction);
    }

    await booking.destroy({ transaction });
  });
};

module.exports = {
  bookingDetailsInclude,
  updateBookingStatusWithInventory,
  deleteBookingWithInventory,
};
