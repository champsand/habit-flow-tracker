const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { isDateString } = require("../utils/date");
const { sendSuccess } = require("../utils/httpResponse");
const habitLogService = require("../services/habitLogService");

const listHabitLogs = asyncHandler(async (req, res) => {
  const { habitId, date, startDate, endDate } = req.query;

  if (date && !isDateString(date)) {
    throw new ApiError(400, "Date must use YYYY-MM-DD format.");
  }

  if (startDate && !isDateString(startDate)) {
    throw new ApiError(400, "Start date must use YYYY-MM-DD format.");
  }

  if (endDate && !isDateString(endDate)) {
    throw new ApiError(400, "End date must use YYYY-MM-DD format.");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new ApiError(400, "Start date must be before or equal to end date.");
  }

  const logs = await habitLogService.listHabitLogs(req.auth.userId, {
    habitId,
    date,
    startDate,
    endDate
  });

  sendSuccess(res, 200, {
    logs
  });
});

const createHabitLog = asyncHandler(async (req, res) => {
  const log = await habitLogService.createHabitLog(req.auth.userId, req.body);

  sendSuccess(res, 201, {
    message: "Habit log created.",
    log
  });
});

const createAvoidanceLog = asyncHandler(async (req, res) => {
  const log = await habitLogService.createAvoidanceLog(req.auth.userId, req.body);

  sendSuccess(res, 201, {
    message: "Bad habit avoidance recorded.",
    log
  });
});

const getHabitLog = asyncHandler(async (req, res) => {
  const log = await habitLogService.getHabitLog(req.auth.userId, req.params.id);

  sendSuccess(res, 200, {
    log
  });
});

const updateHabitLog = asyncHandler(async (req, res) => {
  const log = await habitLogService.updateHabitLog(req.auth.userId, req.params.id, req.body);

  sendSuccess(res, 200, {
    message: "Habit log updated.",
    log
  });
});

const deleteHabitLog = asyncHandler(async (req, res) => {
  await habitLogService.deleteHabitLog(req.auth.userId, req.params.id);

  sendSuccess(res, 200, {
    message: "Habit log deleted."
  });
});

module.exports = {
  listHabitLogs,
  createHabitLog,
  createAvoidanceLog,
  getHabitLog,
  updateHabitLog,
  deleteHabitLog
};
