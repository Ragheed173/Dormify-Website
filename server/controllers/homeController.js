const { User, Housing, HousingImage, Booking } = require("../models");

const getStats = async (req, res) => {
  try {
    const [usersCount, housingsCount, bookingsCount] = await Promise.all([
      User.count(),
      Housing.count(),
      Booking.count(),
    ]);

    return res.status(200).json({
      message: "Stats fetched successfully",
      data: {
        usersCount,
        housingsCount,
        bookingsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

const getFeaturedHousings = async (req, res) => {
  try {
    const featuredHousings = await Housing.findAll({
      where: {
        location: 'Nablus',
        status: 'available',
      },
      include: [
        {
          model: HousingImage,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 6,
    });

    return res.status(200).json({
      message: "Featured housings fetched successfully",
      data: featuredHousings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch featured housings",
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
  getFeaturedHousings,
};