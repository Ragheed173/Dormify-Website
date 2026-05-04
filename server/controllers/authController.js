const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const isStrongPassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password)
}

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

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
      })
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and contain at least one letter and one number',
      })
    }

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      })
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Register failed',
      error: error.message,
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const token = signToken(user)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed',
      error: error.message,
    })
  }
}

module.exports = {
  register,
  login,
}