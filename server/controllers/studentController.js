const { User, Booking, Housing, HousingImage } = require("../models");

const getStudentProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email is already in use",
        });
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
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const getStudentBookings = async (req, res) => {
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
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const getStudentBookingById = async (req, res) => {
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
      return res.status(404).json({
        message: "Booking not found or does not belong to this student",
      });
    }

    return res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

const cancelStudentBooking = async (req, res) => {
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
      return res.status(404).json({
        message: "Booking not found or does not belong to this student",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "confirmed" && booking.Housing) {
      booking.Housing.available_rooms += 1;
      await booking.Housing.save();
    }

    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Housing,
          include: [{ model: HousingImage }],
        },
      ],
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentBookings,
  getStudentBookingById,
  cancelStudentBooking,
};