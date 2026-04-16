const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/dashboard", adminController.getDashboardStats);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.post("/housings", adminController.createHousing);
router.put("/housings/:id", adminController.updateHousing);
router.delete("/housings/:id", adminController.deleteHousing);

router.get("/bookings", adminController.getAllBookings);
router.patch("/bookings/:id/status", adminController.updateBookingStatus);

module.exports = router;