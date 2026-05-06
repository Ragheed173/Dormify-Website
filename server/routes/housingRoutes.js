const express = require("express");
const router = express.Router();
const housingController = require("../controllers/housingController");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators/schemas");

router.get("/", validateRequest(schemas.housingQuery), asyncHandler(housingController.getAllHousings));
router.get(
  "/:id",
  validateRequest(schemas.idParam),
  asyncHandler(housingController.getHousingById)
);

module.exports = router;
