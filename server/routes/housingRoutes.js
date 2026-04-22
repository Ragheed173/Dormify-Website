const express = require("express");
const router = express.Router();
const housingController = require("../controllers/housingController");

router.get("/", housingController.getAllHousings);
router.get("/:id", housingController.getHousingById);

module.exports = router;