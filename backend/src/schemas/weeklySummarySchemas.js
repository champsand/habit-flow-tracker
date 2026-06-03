const { isDateString } = require("../utils/date");

function validateWeeklySummaryGenerate(body) {
  const errors = {};
  const value = {};

  if (Object.prototype.hasOwnProperty.call(body, "weekDate")) {
    value.weekDate = typeof body.weekDate === "string" ? body.weekDate.trim() : "";

    if (!isDateString(value.weekDate)) {
      errors.weekDate = "Week date must use YYYY-MM-DD format.";
    }
  }

  return {
    value,
    errors
  };
}

module.exports = {
  validateWeeklySummaryGenerate
};
