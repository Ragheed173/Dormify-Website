const { Booking, Housing, User, HousingImage, sequelize } = require('../models')

const createBooking = async (req, res) => {
  try {
    const { housing_id, start_date, end_date, notes } = req.body;
    const user_id = req.user.id;

    if (!housing_id || !start_date || !end_date) {
      return res.status(400).json({
        message: "housing_id, start_date, and end_date are required",
      });
    }

    const housing = await Housing.findByPk(housing_id);

    if (!housing) {
      return res.status(404).json({
        message: "Housing not found",
      });
    }

    if (housing.status !== "available" || housing.available_rooms <= 0) {
      return res.status(400).json({
        message: "This housing is not available for booking",
      });
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

    return res.status(201).json({
      message: "Booking created successfully",
      data: createdBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Housing,
        },
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
      ],
    })

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      })
    }

    return res.status(200).json({
      message: 'Booking fetched successfully',
      data: booking,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch booking',
      error: error.message,
    })
  }
};

const updateBookingStatus = async (req, res) => {
  let transaction;

  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "cancelled", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    transaction = await sequelize.transaction();

    const booking = await Booking.findByPk(id, {
      include: [{ model: Housing }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const oldStatus = booking.status;
    const housing = booking.Housing;

    if (!housing) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Related housing not found",
      });
    }

    if (oldStatus !== "confirmed" && status === "confirmed") {
      if (housing.status !== "available" || housing.available_rooms <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "This housing is no longer available",
        });
      }

      housing.available_rooms -= 1;

      if (housing.available_rooms <= 0) {
        housing.available_rooms = 0;
        housing.status = "unavailable";
      }

      await housing.save({ transaction });
    }

    if (
      oldStatus === "confirmed" &&
      ["cancelled", "rejected", "pending"].includes(status)
    ) {
      housing.available_rooms += 1;

      if (housing.available_rooms > 0) {
        housing.status = "available";
      }

      await housing.save({ transaction });
    }

    booking.status = status;
    await booking.save({ transaction });

    await transaction.commit();

    const updatedBooking = await Booking.findByPk(id, {
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

    return res.status(200).json({
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    return res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findByPk(id)

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      })
    }

    await booking.destroy()

    return res.status(200).json({
      message: 'Booking deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete booking',
      error: error.message,
    })
  }
};

module.exports = {
  createBooking,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
}