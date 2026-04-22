const { User, Housing, HousingImage, Booking } = require("../models");

const getOwnerProfile = async (req, res) => {
  try {
    const owner = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found",
      });
    }

    return res.status(200).json({
      message: "Owner profile fetched successfully",
      data: owner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch owner profile",
      error: error.message,
    });
  }
};

const updateOwnerProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const owner = await User.findByPk(req.user.id);

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found",
      });
    }

    if (email && email !== owner.email) {
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email is already in use",
        });
      }
    }

    owner.name = name ?? owner.name;
    owner.email = email ?? owner.email;
    owner.phone = phone ?? owner.phone;

    await owner.save();

    const updatedOwner = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      message: "Owner profile updated successfully",
      data: updatedOwner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update owner profile",
      error: error.message,
    });
  }
};

const getOwnerHousings = async (req, res) => {
  try {
    const housings = await Housing.findAll({
      where: {
        owner_id: req.user.id,
      },
      include: [
        {
          model: HousingImage,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Owner housings fetched successfully",
      data: housings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch owner housings",
      error: error.message,
    });
  }
};

const createOwnerHousing = async (req, res) => {
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

    if (!title || !location || !price || !room_type) {
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
      owner_id: req.user.id,
    });

    if (Array.isArray(image_urls) && image_urls.length > 0) {
      const imageRecords = image_urls.map((url) => ({
        housing_id: housing.id,
        image_url: url,
      }));

      await HousingImage.bulkCreate(imageRecords);
    }

    const createdHousing = await Housing.findByPk(housing.id, {
      include: [{ model: HousingImage }],
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

const updateOwnerHousing = async (req, res) => {
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

    const housing = await Housing.findOne({
      where: {
        id,
        owner_id: req.user.id,
      },
    });

    if (!housing) {
      return res.status(404).json({
        message: "Housing not found or does not belong to this owner",
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
        const imageRecords = image_urls.map((url) => ({
          housing_id: housing.id,
          image_url: url,
        }));

        await HousingImage.bulkCreate(imageRecords);
      }
    }

    const updatedHousing = await Housing.findByPk(housing.id, {
      include: [{ model: HousingImage }],
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

const deleteOwnerHousing = async (req, res) => {
  try {
    const { id } = req.params;

    const housing = await Housing.findOne({
      where: {
        id,
        owner_id: req.user.id,
      },
    });

    if (!housing) {
      return res.status(404).json({
        message: "Housing not found or does not belong to this owner",
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

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Housing,
          where: {
            owner_id: req.user.id,
          },
          include: [{ model: HousingImage }],
        },
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Owner bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch owner bookings",
      error: error.message,
    });
  }
};

const updateOwnerBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['confirmed', 'rejected', 'cancelled']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid booking status',
      })
    }

    const booking = await Booking.findOne({
      where: { id },
      include: [
        {
          model: Housing,
          where: { owner_id: req.user.id },
        },
      ],
    })

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found or does not belong to this owner',
      })
    }

    if (booking.status === 'confirmed' && ['rejected', 'cancelled'].includes(status)) {
      booking.Housing.available_rooms += 1
      await booking.Housing.save()
    }

    if (booking.status !== 'confirmed' && status === 'confirmed') {
      if (booking.Housing.available_rooms <= 0) {
        return res.status(400).json({
          message: 'No available rooms left for confirmation',
        })
      }

      booking.Housing.available_rooms -= 1
      await booking.Housing.save()
    }

    booking.status = status
    await booking.save()

    return res.status(200).json({
      message: 'Booking status updated successfully',
      data: booking,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update booking status',
      error: error.message,
    })
  }
}

module.exports = {
  getOwnerProfile,
  updateOwnerProfile,
  getOwnerHousings,
  createOwnerHousing,
  updateOwnerHousing,
  deleteOwnerHousing,
  getOwnerBookings,
  updateOwnerBookingStatus,
}