const { User, Booking, Housing, HousingImage } = require("../models");
const AppError = require("../utils/AppError");
const { updateBookingStatusWithInventory } = require("../services/bookingService");

const getStudentProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new AppError("Email is already in use", 409, "EMAIL_EXISTS");
      }
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;

    await user.save();

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

const getStudentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: Housing,
          include: [{ model: HousingImage }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    return next(error);
  }
};

const getStudentBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
      include: [
        {
          model: Housing,
          include: [{ model: HousingImage }],
        },
      ],
    });

    if (!booking) {
      throw new AppError(
        "Booking not found or does not belong to this student",
        404,
        "BOOKING_NOT_FOUND"
      );
    }

    return res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelStudentBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
      include: [
        {
          model: Housing,
        },
      ],
    });

    if (!booking) {
      throw new AppError(
        "Booking not found or does not belong to this student",
        404,
        "BOOKING_NOT_FOUND"
      );
    }

    if (booking.status === "cancelled") {
      throw new AppError(
        "Booking is already cancelled",
        400,
        "BOOKING_ALREADY_CANCELLED"
      );
    }

    const updatedBooking = await updateBookingStatusWithInventory({
      bookingId: id,
      bookingWhere: { user_id: req.user.id },
      status: "cancelled",
      notFoundMessage: "Booking not found or does not belong to this student",
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentBookings,
  getStudentBookingById,
  cancelStudentBooking,
};
