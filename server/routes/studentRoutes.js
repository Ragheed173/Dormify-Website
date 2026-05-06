const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators/schemas");

router.use(authMiddleware, roleMiddleware("student"));

router.get("/profile", asyncHandler(studentController.getStudentProfile));
router.put(
  "/profile",
  validateRequest(schemas.profileUpdate),
  asyncHandler(studentController.updateStudentProfile)
);

router.get("/bookings", asyncHandler(studentController.getStudentBookings));
router.get(
  "/bookings/:id",
  validateRequest(schemas.idParam),
  asyncHandler(studentController.getStudentBookingById)
);
router.patch(
  "/bookings/:id/cancel",
  validateRequest(schemas.idParam),
  asyncHandler(studentController.cancelStudentBooking)
);

module.exports = router;
