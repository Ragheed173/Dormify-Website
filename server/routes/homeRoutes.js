const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const asyncHandler = require("../utils/asyncHandler");

router.get("/stats", asyncHandler(homeController.getStats));
router.get("/featured-housings", asyncHandler(homeController.getFeaturedHousings));

module.exports = router;
