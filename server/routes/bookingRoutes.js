const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators/schemas");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  validateRequest(schemas.bookingCreate),
  asyncHandler(bookingController.createBooking)
);
router.get(
  "/:id",
  authMiddleware,
  validateRequest(schemas.idParam),
  asyncHandler(bookingController.getBookingById)
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest({ ...schemas.idParam, ...schemas.bookingStatus }),
  asyncHandler(bookingController.updateBookingStatus)
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(schemas.idParam),
  asyncHandler(bookingController.deleteBooking)
);

module.exports = router;
