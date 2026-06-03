const express = require("express");
const weeklySummaryController = require("../controllers/weeklySummaryController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const { validateWeeklySummaryGenerate } = require("../schemas/weeklySummarySchemas");

const router = express.Router();

router.use(requireAuth);

router.get("/current", weeklySummaryController.getCurrentSummary);
router.post("/generate", validateBody(validateWeeklySummaryGenerate), weeklySummaryController.generateSummary);
router.get("/:weekId", weeklySummaryController.getSummaryById);

module.exports = router;
