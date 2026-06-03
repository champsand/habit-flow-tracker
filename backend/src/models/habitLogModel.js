const { toDateString } = require("../utils/date");

function toHabitLogResponse(log) {
  if (!log) {
    return null;
  }

  return {
    id: log.id,
    userId: log.userId,
    habitId: log.habitId,
    date: toDateString(log.date),
    amount: log.amount,
    note: log.note,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  };
}

module.exports = {
  toHabitLogResponse
};
