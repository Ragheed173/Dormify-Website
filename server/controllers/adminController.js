const { User, Housing, HousingImage, Booking } = require("../models");
const AppError = require("../utils/AppError");
const userEventEmitter = require("../events/userEvents");
const { updateBookingStatusWithInventory } = require("../services/bookingService");

const getDashboardStats = async (req, res, next) => {
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
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
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
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await User.findByPk(id);

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
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      throw new AppError(
        "Admin cannot delete their own account",
        400,
        "SELF_DELETE_NOT_ALLOWED"
      );
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const createHousing = async (req, res, next) => {
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
      owner_id,
      image_urls,
    } = req.body;

    const owner = await User.findByPk(owner_id);

    if (!owner || owner.role !== "owner") {
      throw new AppError(
        "owner_id must belong to an owner user",
        400,
        "INVALID_OWNER"
      );
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
      owner_id,
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

    userEventEmitter.emit('housing:created', createdHousing)

    return res.status(201).json({
      message: "Housing created successfully",
      data: createdHousing,
    });
  } catch (error) {
    return next(error);
  }
};

const updateHousing = async (req, res, next) => {
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
      throw new AppError("Housing not found", 404, "HOUSING_NOT_FOUND");
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
    return next(error);
  }
};

const deleteHousing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const housing = await Housing.findByPk(id);

    if (!housing) {
      throw new AppError("Housing not found", 404, "HOUSING_NOT_FOUND");
    }

    await housing.destroy();

    return res.status(200).json({
      message: "Housing deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const getAllBookings = async (req, res, next) => {
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

    return res.status(200).json({
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return next(error);
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
