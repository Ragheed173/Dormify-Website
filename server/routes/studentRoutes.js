const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/profile", studentController.getStudentProfile);
router.put("/profile", studentController.updateStudentProfile);

router.get("/bookings", studentController.getStudentBookings);
router.get("/bookings/:id", studentController.getStudentBookingById);
router.patch("/bookings/:id/cancel", studentController.cancelStudentBooking);

module.exports = router;