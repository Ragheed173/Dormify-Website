const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.patch("/:id/status", authMiddleware, bookingController.updateBookingStatus);
router.delete("/:id", authMiddleware, bookingController.deleteBooking);

module.exports = router;