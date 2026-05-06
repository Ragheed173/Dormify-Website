const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/ownerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators/schemas");

router.use(authMiddleware, roleMiddleware("owner"));

router.get("/profile", asyncHandler(ownerController.getOwnerProfile));
router.put(
  "/profile",
  validateRequest(schemas.profileUpdate),
  asyncHandler(ownerController.updateOwnerProfile)
);

router.get("/housings", asyncHandler(ownerController.getOwnerHousings));
router.post(
  "/housings",
  validateRequest(schemas.housingBody(true)),
  asyncHandler(ownerController.createOwnerHousing)
);
router.put(
  "/housings/:id",
  validateRequest({ ...schemas.idParam, ...schemas.housingBody(false) }),
  asyncHandler(ownerController.updateOwnerHousing)
);
router.delete(
  "/housings/:id",
  validateRequest(schemas.idParam),
  asyncHandler(ownerController.deleteOwnerHousing)
);

router.get('/bookings', asyncHandler(ownerController.getOwnerBookings))
router.patch(
  '/bookings/:id/status',
  validateRequest({ ...schemas.idParam, ...schemas.ownerBookingStatus }),
  asyncHandler(ownerController.updateOwnerBookingStatus)
)

module.exports = router;
