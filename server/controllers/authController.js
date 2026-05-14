const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const AppError = require('../utils/AppError')
const { sendPasswordChangeEmail } = require('../utils/emailService')


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

const userEventEmitter = require('../events/userEvents')

const hashPasswordChangeToken = (plain) =>
  crypto.createHash('sha256').update(String(plain).trim(), 'utf8').digest('hex')

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

    userEventEmitter.emit('user:created', user)

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
const requestPasswordChangeEmail = async (req, res, next) => {
  try {
    const user = await User.unscoped().findByPk(req.user.id)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    if (!['student', 'owner'].includes(user.role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN')
    }

    const plainToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = hashPasswordChangeToken(plainToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    user.password_change_token_hash = tokenHash
    user.password_change_token_expires = expiresAt
    await user.save()

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    const changeUrl = `${frontendUrl}/password-change?token=${encodeURIComponent(plainToken)}`

    try {
      await sendPasswordChangeEmail({
        email: user.email,
        name: user.name,
        changeUrl,
      })
    } catch (err) {
      user.password_change_token_hash = null
      user.password_change_token_expires = null
      await user.save()

      if (err.code === 'EMAIL_NOT_CONFIGURED') {
        return next(
          new AppError(
            'Email is not configured on this server. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in the environment.',
            503,
            'EMAIL_NOT_CONFIGURED'
          )
        )
      }
      return next(
        new AppError('Could not send the confirmation email. Try again later.', 503, 'EMAIL_SEND_FAILED')
      )
    }

    return res.status(200).json({
      message: 'Check your email for a link to finish changing your password. The link expires in one hour.',
    })
  } catch (error) {
    return next(error)
  }
}

const completePasswordChangeWithToken = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    const tokenHash = hashPasswordChangeToken(token)

    const user = await User.unscoped().findOne({
      where: { password_change_token_hash: tokenHash },
    })

    if (!user || !user.password_change_token_expires) {
      throw new AppError('Invalid or expired link. Request a new password change email from your dashboard.', 400, 'INVALID_OR_EXPIRED_TOKEN')
    }

    if (new Date(user.password_change_token_expires) < new Date()) {
      user.password_change_token_hash = null
      user.password_change_token_expires = null
      await user.save()
      throw new AppError('Invalid or expired link. Request a new password change email from your dashboard.', 400, 'INVALID_OR_EXPIRED_TOKEN')
    }

    if (!['student', 'owner'].includes(user.role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN')
    }

    const oauthPlaceholder = user.password === 'google_oauth_user'
    if (!oauthPlaceholder) {
      const sameAsCurrent = await bcrypt.compare(newPassword, user.password)
      if (sameAsCurrent) {
        throw new AppError('New password must be different from your current password', 400, 'SAME_PASSWORD')
      }
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.password_change_token_hash = null
    user.password_change_token_expires = null
    await user.save()

    return res.status(200).json({
      message: 'Password updated successfully. You can sign in with your new password.',
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
  requestPasswordChangeEmail,
  completePasswordChangeWithToken,
}
