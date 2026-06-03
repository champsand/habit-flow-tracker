const { HABIT_CATEGORIES, HABIT_TYPES } = require("../models/habitModel");

function validateWeeklyTarget(value, errors, { category, type } = {}) {
  const weeklyTarget = Number(value);
  const isDayBasedTarget = category === "bad" || (category === "good" && type === "checklist");

  if (!Number.isInteger(weeklyTarget) || weeklyTarget <= 0) {
    errors.weeklyTarget = "Weekly target must be a positive integer.";
  } else if (isDayBasedTarget && weeklyTarget > 7) {
    errors.weeklyTarget = "Day-based weekly targets must be between 1 and 7.";
  } else if (!isDayBasedTarget && weeklyTarget > 10000) {
    errors.weeklyTarget = "Weekly target must be a positive integer up to 10000.";
  }

  return weeklyTarget;
}

function validateHabitCreate(body) {
  const errors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
  const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
  const weeklyTarget = validateWeeklyTarget(body.weeklyTarget, errors, { category, type });
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  if (!name || name.length > 120) {
    errors.name = "Habit name is required and must be 120 characters or fewer.";
  }

  if (category !== "bad" && !HABIT_TYPES.includes(type)) {
    errors.type = "Habit type must be checklist, frequency, or duration.";
  }

  if (!HABIT_CATEGORIES.includes(category)) {
    errors.category = "Habit category must be good or bad.";
  }

  return {
    value: {
      name,
      type: category === "bad" ? "checklist" : type,
      category,
      weeklyTarget,
      isActive
    },
    errors
  };
}

function validateHabitUpdate(body) {
  const errors = {};
  const value = {};

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    value.name = typeof body.name === "string" ? body.name.trim() : "";

    if (!value.name || value.name.length > 120) {
      errors.name = "Habit name must be 120 characters or fewer.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "type")) {
    value.type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";

    if (!HABIT_TYPES.includes(value.type)) {
      errors.type = "Habit type must be checklist, frequency, or duration.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "category")) {
    value.category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";

    if (!HABIT_CATEGORIES.includes(value.category)) {
      errors.category = "Habit category must be good or bad.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "weeklyTarget")) {
    value.weeklyTarget = validateWeeklyTarget(body.weeklyTarget, errors);
  }

  if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
    value.isActive = body.isActive;

    if (typeof value.isActive !== "boolean") {
      errors.isActive = "Active status must be true or false.";
    }
  }

  if (Object.keys(value).length === 0) {
    errors.body = "At least one habit field is required.";
  }

  return {
    value,
    errors
  };
}

module.exports = {
  validateHabitCreate,
  validateHabitUpdate
};
