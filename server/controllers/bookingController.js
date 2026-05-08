const { Op } = require("sequelize");
const { Booking, Housing, User, HousingImage } = require("../models");
const AppError = require("../utils/AppError");
const userEventEmitter = require("../events/userEvents");
const {
  updateBookingStatusWithInventory,
  deleteBookingWithInventory,
} = require("../services/bookingService");

const createBooking = async (req, res, next) => {
  try {
    const { housing_id, start_date, end_date, notes } = req.body;
    const user_id = req.user.id;

    const housing = await Housing.findByPk(housing_id);

    if (!housing) {
      throw new AppError("Housing not found", 404, "HOUSING_NOT_FOUND");
    }

    if (housing.status !== "available" || housing.available_rooms <= 0) {
      throw new AppError(
        "This housing is not available for booking",
        400,
        "HOUSING_UNAVAILABLE"
      );
    }

    const activeBooking = await Booking.findOne({
      where: {
        user_id,
        housing_id,
        status: {
          [Op.in]: ["pending", "confirmed"],
        },
      },
    });

    if (activeBooking) {
      throw new AppError(
        "You already have an active booking for this housing",
        409,
        "BOOKING_ALREADY_EXISTS"
      );
    }

    const booking = await Booking.create({
      user_id,
      housing_id,
      start_date,
      end_date,
      notes,
      status: "pending",
    });

    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
        {
          model: Housing,
          include: [{ model: HousingImage }],
        },
      ],
    });

    userEventEmitter.emit("booking:created", createdBooking);

    return res.status(201).json({
      message: "Booking created successfully",
      data: createdBooking,
    });
  } catch (error) {
    return next(error);
  }
};

const canAccessBooking = (user, booking) => {
  if (user.role === "admin") return true;
  if (booking.user_id === user.id) return true;
  return booking.Housing?.owner_id === user.id;
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Housing,
        },
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (!canAccessBooking(req.user, booking)) {
      throw new AppError("Forbidden: access denied", 403, "FORBIDDEN");
    }

    return res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    return next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await updateBookingStatusWithInventory({
      bookingId: id,
      status,
    });

    userEventEmitter.emit("booking:status_updated", {
      booking: updatedBooking,
      status,
    });

    return res.status(200).json({
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteBookingWithInventory(id);

    userEventEmitter.emit("booking:deleted", {
      bookingId: id,
      userId: req.user?.id,
    });

    return res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBooking,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};
