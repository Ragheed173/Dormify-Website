const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const validateRequest = require("../middleware/validateRequest");
const schemas = require("../validators/schemas");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", aiController.getInfo);
router.post("/explain", validateRequest(schemas.aiExplain), asyncHandler(aiController.explainTopic));

module.exports = router;
