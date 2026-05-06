const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const AppError = require('../utils/AppError')

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const serializeAuthUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
})

/**
 * Registers a student or owner, hashes the password, and returns a JWT for the new session.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: role || 'student',
    })

    const token = signToken(user)

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: serializeAuthUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Authenticates a local email/password login and returns the same JWT payload used by register.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    if (user.google_id && user.password === 'google_oauth_user') {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const token = signToken(user)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: serializeAuthUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
}
