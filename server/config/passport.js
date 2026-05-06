const passport = require("passport")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const { User } = require("../models")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName
        const googleId = profile.id

        if (!email) {
          return done(new Error("Google account email not found"), null)
        }

        let user = await User.findOne({ where: { email } })

        if (!user) {
          const randomPassword = crypto.randomBytes(32).toString("hex")

          user = await User.create({
            name,
            email,
            password: await bcrypt.hash(randomPassword, 10),
            phone: null,
            role: "student",
            google_id: googleId,
          })
        } else if (!user.google_id) {
          user.google_id = googleId
          await user.save()
        }

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport
