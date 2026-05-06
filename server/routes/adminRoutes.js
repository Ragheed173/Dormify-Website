const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators/schemas");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/dashboard", asyncHandler(adminController.getDashboardStats));

router.get("/users", asyncHandler(adminController.getAllUsers));
router.get(
  "/users/:id",
  validateRequest(schemas.idParam),
  asyncHandler(adminController.getUserById)
);
router.put(
  "/users/:id",
  validateRequest({ ...schemas.idParam, ...schemas.userUpdate }),
  asyncHandler(adminController.updateUser)
);
router.delete(
  "/users/:id",
  validateRequest(schemas.idParam),
  asyncHandler(adminController.deleteUser)
);

router.post(
  "/housings",
  validateRequest(schemas.adminHousingCreate),
  asyncHandler(adminController.createHousing)
);
router.put(
  "/housings/:id",
  validateRequest({ ...schemas.idParam, ...schemas.housingBody(false) }),
  asyncHandler(adminController.updateHousing)
);
router.delete(
  "/housings/:id",
  validateRequest(schemas.idParam),
  asyncHandler(adminController.deleteHousing)
);

router.get("/bookings", asyncHandler(adminController.getAllBookings));
router.patch(
  "/bookings/:id/status",
  validateRequest({ ...schemas.idParam, ...schemas.bookingStatus }),
  asyncHandler(adminController.updateBookingStatus)
);

module.exports = router;
