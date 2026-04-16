const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const housingRoutes = require("./routes/housingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/housings", housingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

module.exports = app;