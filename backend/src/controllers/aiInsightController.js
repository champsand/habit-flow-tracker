const asyncHandler = require("../utils/asyncHandler");
const weeklySummaryService = require("../services/weeklySummaryService");
const { sendSuccess } = require("../utils/httpResponse");

const generateInsight = asyncHandler(async (req, res) => {
  const insight = await weeklySummaryService.generateInsightPreview(req.auth.userId, req.body);

  sendSuccess(res, 200, {
    insight
  });
});

module.exports = {
  generateInsight
};
