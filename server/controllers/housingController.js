const { Op } = require("sequelize");
const { Housing, HousingImage } = require("../models");
const AppError = require("../utils/AppError");

const getAllHousings = async (req, res, next) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      gender_allowed,
      room_type,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {
      location: 'Nablus',
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price[Op.gte] = Number(minPrice);
      }

      if (maxPrice) {
        where.price[Op.lte] = Number(maxPrice);
      }
    }

    if (gender_allowed) {
      where.gender_allowed = gender_allowed;
    }

    if (room_type) {
      where.room_type = room_type;
    }

    if (status) {
      where.status = status;
    }

    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Housing.findAndCountAll({
      where,
      include: [
        {
          model: HousingImage,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNumber,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      message: "Housings fetched successfully",
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: pageNumber,
        totalPages: Math.ceil(count / limitNumber),
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getHousingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const housing = await Housing.findByPk(id, {
      include: [
        {
          model: HousingImage,
        },
      ],
    });

    if (!housing) {
      throw new AppError("Housing not found", 404, "HOUSING_NOT_FOUND");
    }

    return res.status(200).json({
      message: "Housing fetched successfully",
      data: housing,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllHousings,
  getHousingById,
};
