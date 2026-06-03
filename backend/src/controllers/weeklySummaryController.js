const asyncHandler = require("../utils/asyncHandler");
const weeklySummaryService = require("../services/weeklySummaryService");
const { sendSuccess } = require("../utils/httpResponse");

const getCurrentSummary = asyncHandler(async (req, res) => {
  const weeklySummary = await weeklySummaryService.getCurrentSummary(req.auth.userId);

  sendSuccess(res, 200, {
    weeklySummary
  });
});

const getSummaryById = asyncHandler(async (req, res) => {
  const weeklySummary = await weeklySummaryService.getSummaryById(req.auth.userId, req.params.weekId);

  sendSuccess(res, 200, {
    weeklySummary
  });
});

const generateSummary = asyncHandler(async (req, res) => {
  const weeklySummary = await weeklySummaryService.generateSummary(req.auth.userId, req.body);

  sendSuccess(res, 201, {
    message: "Weekly summary generated.",
    weeklySummary
  });
});

module.exports = {
  getCurrentSummary,
  getSummaryById,
  generateSummary
};
