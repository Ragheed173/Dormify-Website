const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()

const authController = require('../controllers/authController')
const asyncHandler = require('../utils/asyncHandler')
const validateRequest = require('../middleware/validateRequest')
const schemas = require('../validators/schemas')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/register', validateRequest(schemas.register), asyncHandler(authController.register))
router.post('/login', validateRequest(schemas.login), asyncHandler(authController.login))
router.post(
  '/password/change-request',
  authMiddleware,
  roleMiddleware('student', 'owner'),
  asyncHandler(authController.requestPasswordChangeEmail)
)

router.post(
  '/password/change-complete',
  validateRequest(schemas.passwordChangeComplete),
  asyncHandler(authController.completePasswordChangeWithToken)
)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-success?token=${token}`)
  }
)

module.exports = router
