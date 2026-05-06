const express = require("express")
const cors = require("cors")
const session = require("express-session")
const swaggerUi = require("swagger-ui-express")
const passport = require("./config/passport")
const swaggerSpec = require("./config/swagger")

const authRoutes = require("./routes/authRoutes")
const homeRoutes = require("./routes/homeRoutes")
const housingRoutes = require("./routes/housingRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const studentRoutes = require("./routes/studentRoutes")
const adminRoutes = require("./routes/adminRoutes")
const ownerRoutes = require("./routes/ownerRoutes")

const errorMiddleware = require("./middleware/errorMiddleware")
const AppError = require("./utils/AppError")

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
)

app.use(express.json({ limit: "1mb" }))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" })
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json")
  res.send(swaggerSpec)
})

app.use("/api/auth", authRoutes)
app.use("/api/home", homeRoutes)
app.use("/api/housings", housingRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/owner", ownerRoutes)

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"))
})

app.use(errorMiddleware)

module.exports = app
