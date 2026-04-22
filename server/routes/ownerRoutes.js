const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/ownerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("owner"));

router.get("/profile", ownerController.getOwnerProfile);
router.put("/profile", ownerController.updateOwnerProfile);

router.get("/housings", ownerController.getOwnerHousings);
router.post("/housings", ownerController.createOwnerHousing);
router.put("/housings/:id", ownerController.updateOwnerHousing);
router.delete("/housings/:id", ownerController.deleteOwnerHousing);

router.get('/bookings', ownerController.getOwnerBookings)
router.patch('/bookings/:id/status', ownerController.updateOwnerBookingStatus)

module.exports = router;