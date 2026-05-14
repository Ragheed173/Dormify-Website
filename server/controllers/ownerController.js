const { User, Housing, HousingImage, Booking } = require('../models')
const AppError = require('../utils/AppError')
const userEventEmitter = require('../events/userEvents')
const { updateBookingStatusWithInventory } = require('../services/bookingService')

const getOwnerProfile = async (req, res, next) => {
  try {
    const owner = await User.findByPk(req.user.id)

    if (!owner) {
      throw new AppError('Owner not found', 404, 'USER_NOT_FOUND')
    }
   const data = owner.toJSON()
    const oauthNoLocalPassword = data.password === 'google_oauth_user'
    delete data.password
    data.oauth_no_local_password = oauthNoLocalPassword
    return res.status(200).json({
      message: 'Owner profile fetched successfully',
      data,
    })
  } catch (error) {
    return next(error)
  }
}

const updateOwnerProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body

    const owner = await User.findByPk(req.user.id)

    if (!owner) {
      throw new AppError('Owner not found', 404, 'USER_NOT_FOUND')
    }

    if (email && email !== owner.email) {
      const existingUser = await User.findOne({
        where: { email },
      })

      if (existingUser) {
        throw new AppError('Email is already in use', 409, 'EMAIL_EXISTS')
      }
    }

    owner.name = name ?? owner.name
    owner.email = email ?? owner.email
    owner.phone = phone ?? owner.phone

    await owner.save()

   await owner.reload()
    const data = owner.toJSON()
    const oauthNoLocalPassword = data.password === 'google_oauth_user'
    delete data.password
    data.oauth_no_local_password = oauthNoLocalPassword

    return res.status(200).json({
      message: 'Owner profile updated successfully',
      data,
    })
  } catch (error) {
    return next(error)
  }
}

const getOwnerHousings = async (req, res, next) => {
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
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json({
      message: 'Owner housings fetched successfully',
      data: housings,
    })
  } catch (error) {
    return next(error)
  }
}

const createOwnerHousing = async (req, res, next) => {
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
    } = req.body

    if (!title || !location || price == null || !room_type) {
      throw new AppError(
        'title, location, price, and room_type are required',
        400,
        'VALIDATION_ERROR'
      )
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
    })

    if (Array.isArray(image_urls) && image_urls.length > 0) {
      const imageRecords = image_urls.map((url) => ({
        housing_id: housing.id,
        image_url: url,
      }))

      await HousingImage.bulkCreate(imageRecords)
    }

    const createdHousing = await Housing.findByPk(housing.id, {
      include: [{ model: HousingImage }],
    })

    userEventEmitter.emit('housing:created', createdHousing)

    return res.status(201).json({
      message: 'Housing created successfully',
      data: createdHousing,
    })
  } catch (error) {
    return next(error)
  }
}

const updateOwnerHousing = async (req, res, next) => {
  try {
    const { id } = req.params
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
    } = req.body

    const housing = await Housing.findOne({
      where: {
        id,
        owner_id: req.user.id,
      },
    })

    if (!housing) {
      throw new AppError(
        'Housing not found or does not belong to this owner',
        404,
        'HOUSING_NOT_FOUND'
      )
    }

    housing.title = title ?? housing.title
    housing.description = description ?? housing.description
    housing.location = location ?? housing.location
    housing.price = price ?? housing.price
    housing.gender_allowed = gender_allowed ?? housing.gender_allowed
    housing.room_type = room_type ?? housing.room_type
    housing.available_rooms = available_rooms ?? housing.available_rooms
    housing.status = status ?? housing.status

    await housing.save()

    if (Array.isArray(image_urls)) {
      await HousingImage.destroy({
        where: { housing_id: housing.id },
      })

      if (image_urls.length > 0) {
        const imageRecords = image_urls.map((url) => ({
          housing_id: housing.id,
          image_url: url,
        }))

        await HousingImage.bulkCreate(imageRecords)
      }
    }

    const updatedHousing = await Housing.findByPk(housing.id, {
      include: [{ model: HousingImage }],
    })

    return res.status(200).json({
      message: 'Housing updated successfully',
      data: updatedHousing,
    })
  } catch (error) {
    return next(error)
  }
}

const deleteOwnerHousing = async (req, res, next) => {
  try {
    const { id } = req.params

    const housing = await Housing.findOne({
      where: {
        id,
        owner_id: req.user.id,
      },
    })

    if (!housing) {
      throw new AppError(
        'Housing not found or does not belong to this owner',
        404,
        'HOUSING_NOT_FOUND'
      )
    }

    await housing.destroy()

    return res.status(200).json({
      message: 'Housing deleted successfully',
    })
  } catch (error) {
    return next(error)
  }
}

const getOwnerBookings = async (req, res, next) => {
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
          attributes: { exclude: ['password'] },
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json({
      message: 'Owner bookings fetched successfully',
      data: bookings,
    })
  } catch (error) {
    return next(error)
  }
}

const updateOwnerBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updatedBooking = await updateBookingStatusWithInventory({
      bookingId: id,
      status,
      housingWhere: { owner_id: req.user.id },
      notFoundMessage: 'Booking not found or does not belong to this owner',
    })

    return res.status(200).json({
      message: 'Booking status updated successfully',
      data: updatedBooking,
    })
  } catch (error) {
    return next(error)
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
