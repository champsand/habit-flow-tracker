const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { isDateString } = require("../utils/date");
const { sendSuccess } = require("../utils/httpResponse");
const checkinService = require("../services/checkinService");

const listCheckins = asyncHandler(async (req, res) => {
  const checkins = await checkinService.listCheckins(req.auth.userId);

  sendSuccess(res, 200, {
    checkins
  });
});

const createCheckin = asyncHandler(async (req, res) => {
  const checkin = await checkinService.createCheckin(req.auth.userId, req.body);

  sendSuccess(res, 201, {
    message: "Check-in created.",
    checkin
  });
});

const getCheckinByDate = asyncHandler(async (req, res) => {
  if (!isDateString(req.params.date)) {
    throw new ApiError(400, "Date must use YYYY-MM-DD format.");
  }

  const checkin = await checkinService.getCheckinByDate(req.auth.userId, req.params.date);

  sendSuccess(res, 200, {
    checkin
  });
});

const updateCheckin = asyncHandler(async (req, res) => {
  const checkin = await checkinService.updateCheckin(req.auth.userId, req.params.id, req.body);

  sendSuccess(res, 200, {
    message: "Check-in updated.",
    checkin
  });
});

module.exports = {
  listCheckins,
  createCheckin,
  getCheckinByDate,
  updateCheckin
};
