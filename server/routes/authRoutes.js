const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const router = express.Router()

const authController = require("../controllers/authController")

router.post("/register", authController.register)
router.post("/login", authController.login)

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
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
      { expiresIn: "7d" }
    )

    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`)
  }
)

module.exports = router