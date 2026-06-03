const { toDateString } = require("../utils/date");

const ENERGY_LEVELS = ["low", "medium", "high"];

function toCheckinResponse(checkin) {
  if (!checkin) {
    return null;
  }

  return {
    id: checkin.id,
    userId: checkin.userId,
    date: toDateString(checkin.date),
    mood: checkin.mood,
    energy: checkin.energy,
    note: checkin.note,
    createdAt: checkin.createdAt,
    updatedAt: checkin.updatedAt
  };
}

module.exports = {
  ENERGY_LEVELS,
  toCheckinResponse
};
