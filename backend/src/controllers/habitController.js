const asyncHandler = require("../utils/asyncHandler");
const habitService = require("../services/habitService");
const { sendSuccess } = require("../utils/httpResponse");

const listHabits = asyncHandler(async (req, res) => {
  const habits = await habitService.listHabits(req.auth.userId);

  sendSuccess(res, 200, {
    habits
  });
});

const createHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.createHabit(req.auth.userId, req.body);

  sendSuccess(res, 201, {
    message: "Habit created.",
    habit
  });
});

const getHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.getHabit(req.auth.userId, req.params.id);

  sendSuccess(res, 200, {
    habit
  });
});

const updateHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.updateHabit(req.auth.userId, req.params.id, req.body);

  sendSuccess(res, 200, {
    message: "Habit updated.",
    habit
  });
});

const deleteHabit = asyncHandler(async (req, res) => {
  await habitService.deleteHabit(req.auth.userId, req.params.id);

  sendSuccess(res, 200, {
    message: "Habit deleted."
  });
});

module.exports = {
  listHabits,
  createHabit,
  getHabit,
  updateHabit,
  deleteHabit
};
