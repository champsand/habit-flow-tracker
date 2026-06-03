const express = require("express");
const aiInsightController = require("../controllers/aiInsightController");
const { requireAuth } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/securityMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const { validateWeeklySummaryGenerate } = require("../schemas/weeklySummarySchemas");

const router = express.Router();

router.use(requireAuth);

router.post("/insight/generate", aiLimiter, validateBody(validateWeeklySummaryGenerate), aiInsightController.generateInsight);

module.exports = router;
