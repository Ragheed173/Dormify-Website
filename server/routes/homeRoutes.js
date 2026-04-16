const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/featured-housings", homeController.getFeaturedHousings);
router.get("/stats", homeController.getStats);

module.exports = router;