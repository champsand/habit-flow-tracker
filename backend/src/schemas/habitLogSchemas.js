const { isDateString, isFutureDateString } = require("../utils/date");

function normalizeNote(note) {
  if (note === undefined || note === null) {
    return null;
  }

  return String(note).trim() || null;
}

function validateHabitLogCreate(body) {
  const errors = {};
  const habitId = typeof body.habitId === "string" ? body.habitId.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const amount = Number(body.amount);
  const note = normalizeNote(body.note);

  if (!habitId) {
    errors.habitId = "Habit id is required.";
  }

  if (!isDateString(date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  } else if (isFutureDateString(date)) {
    errors.date = "Habit logs cannot be submitted for future dates.";
  }

  if (!Number.isInteger(amount) || amount < 0 || amount > 10000) {
    errors.amount = "Amount is required and must be a non-negative integer up to 10000.";
  }

  if (note && note.length > 500) {
    errors.note = "Note must be 500 characters or fewer.";
  }

  return {
    value: {
      habitId,
      date,
      amount,
      note
    },
    errors
  };
}

function validateHabitLogUpdate(body) {
  const errors = {};
  const value = {};

  if (Object.prototype.hasOwnProperty.call(body, "date")) {
    value.date = typeof body.date === "string" ? body.date.trim() : "";

    if (!isDateString(value.date)) {
      errors.date = "Date must use YYYY-MM-DD format.";
    } else if (isFutureDateString(value.date)) {
      errors.date = "Habit logs cannot be submitted for future dates.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "amount")) {
    value.amount = Number(body.amount);

    if (!Number.isInteger(value.amount) || value.amount < 0 || value.amount > 10000) {
      errors.amount = "Amount must be a non-negative integer up to 10000.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "note")) {
    value.note = normalizeNote(body.note);

    if (value.note && value.note.length > 500) {
      errors.note = "Note must be 500 characters or fewer.";
    }
  }

  if (Object.keys(value).length === 0) {
    errors.body = "At least one habit log field is required.";
  }

  return {
    value,
    errors
  };
}

function validateAvoidanceCreate(body) {
  const errors = {};
  const habitId = typeof body.habitId === "string" ? body.habitId.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const note = normalizeNote(body.note);

  if (!habitId) {
    errors.habitId = "Habit id is required.";
  }

  if (!isDateString(date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  } else if (isFutureDateString(date)) {
    errors.date = "Avoidance logs cannot be submitted for future dates.";
  }

  if (note && note.length > 500) {
    errors.note = "Note must be 500 characters or fewer.";
  }

  return {
    value: {
      habitId,
      date,
      note
    },
    errors
  };
}

module.exports = {
  validateHabitLogCreate,
  validateHabitLogUpdate,
  validateAvoidanceCreate
};
