const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/stats", homeController.getStats);
router.get("/featured-housings", homeController.getFeaturedHousings);

module.exports = router;