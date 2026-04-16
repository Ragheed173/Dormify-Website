const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, studentController.getProfile);
router.put("/profile", authMiddleware, studentController.updateProfile);
router.get("/bookings", authMiddleware, studentController.getMyBookings);
router.get("/bookings/:id", authMiddleware, studentController.getMyBookingById);
router.patch("/bookings/:id/cancel", authMiddleware, studentController.cancelBooking);

module.exports = router;