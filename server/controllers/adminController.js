const { User, Housing, HousingImage, Booking, sequelize } = require("../models");

const getDashboardStats = async (req, res) => {
  try {
    const [
      usersCount,
      housingsCount,
      bookingsCount,
      pendingBookingsCount,
      confirmedBookingsCount,
    ] = await Promise.all([
      User.count(),
      Housing.count(),
      Booking.count(),
      Booking.count({ where: { status: "pending" } }),
      Booking.count({ where: { status: "confirmed" } }),
    ]);

    return res.status(200).json({
      message: "Dashboard stats fetched successfully",
      data: {
        usersCount,
        housingsCount,
        bookingsCount,
        pendingBookingsCount,
        confirmedBookingsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await User.findByPk(id);

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
    user.role = role ?? user.role;

    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const createHousing = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      gender_allowed,
      room_type,
      available_rooms,
      status,
      image_urls,
    } = req.body;

    if (!title || !location || price == null || !room_type) {
      return res.status(400).json({
        message: "title, location, price, and room_type are required",
      });
    }

    const housing = await Housing.create({
      title,
      description,
      location,
      price,
      gender_allowed,
      room_type,
      available_rooms,
      status,
    });

    if (Array.isArray(image_urls) && image_urls.length > 0) {
      const imagesPayload = image_urls.map((url) => ({
        housing_id: housing.id,
        image_url: url,
      }));

      await HousingImage.bulkCreate(imagesPayload);
    }

    const createdHousing = await Housing.findByPk(housing.id, {
      include: [
        {
          model: HousingImage,
        },
      ],
    });

    return res.status(201).json({
      message: "Housing created successfully",
      data: createdHousing,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create housing",
      error: error.message,
    });
  }
};

const updateHousing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      price,
      gender_allowed,
      room_type,
      available_rooms,
      status,
      image_urls,
    } = req.body;

    const housing = await Housing.findByPk(id);

    if (!housing) {
      return res.status(404).json({
        message: "Housing not found",
      });
    }

    housing.title = title ?? housing.title;
    housing.description = description ?? housing.description;
    housing.location = location ?? housing.location;
    housing.price = price ?? housing.price;
    housing.gender_allowed = gender_allowed ?? housing.gender_allowed;
    housing.room_type = room_type ?? housing.room_type;
    housing.available_rooms = available_rooms ?? housing.available_rooms;
    housing.status = status ?? housing.status;

    await housing.save();

    if (Array.isArray(image_urls)) {
      await HousingImage.destroy({
        where: { housing_id: housing.id },
      });

      if (image_urls.length > 0) {
        const imagesPayload = image_urls.map((url) => ({
          housing_id: housing.id,
          image_url: url,
        }));

        await HousingImage.bulkCreate(imagesPayload);
      }
    }

    const updatedHousing = await Housing.findByPk(housing.id, {
      include: [
        {
          model: HousingImage,
        },
      ],
    });

    return res.status(200).json({
      message: "Housing updated successfully",
      data: updatedHousing,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update housing",
      error: error.message,
    });
  }
};

const deleteHousing = async (req, res) => {
  try {
    const { id } = req.params;

    const housing = await Housing.findByPk(id);

    if (!housing) {
      return res.status(404).json({
        message: "Housing not found",
      });
    }

    await housing.destroy();

    return res.status(200).json({
      message: "Housing deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete housing",
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
        {
          model: Housing,
          include: [
            {
              model: HousingImage,
            },
          ],
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
      include: [
        {
          model: Housing,
        },
      ],
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
      if (housing.available_rooms <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "No available rooms left for confirmation",
        });
      }

      housing.available_rooms -= 1;
      await housing.save({ transaction });
    }

    if (
      oldStatus === "confirmed" &&
      (status === "cancelled" || status === "rejected" || status === "pending")
    ) {
      housing.available_rooms += 1;
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
          include: [
            {
              model: HousingImage,
            },
          ],
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createHousing,
  updateHousing,
  deleteHousing,
  getAllBookings,
  updateBookingStatus,
};