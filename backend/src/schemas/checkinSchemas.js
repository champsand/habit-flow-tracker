const { ENERGY_LEVELS } = require("../models/checkinModel");
const { isDateString, isFutureDateString } = require("../utils/date");

const MOOD_VALUES = ["great", "good", "okay", "low", "bad"];

function normalizeNote(note) {
  if (note === undefined || note === null) {
    return null;
  }

  return String(note).trim() || null;
}

function normalizeMood(mood) {
  const normalized = String(mood ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[^\w]+/, "")
    .trim();

  if (normalized.startsWith("great")) return "great";
  if (normalized.startsWith("good")) return "good";
  if (normalized.startsWith("okay") || normalized.startsWith("ok")) return "okay";
  if (normalized.startsWith("low")) return "low";
  if (normalized.startsWith("bad")) return "bad";

  return normalized;
}

function validateCheckinCreate(body) {
  const errors = {};
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const mood = normalizeMood(body.mood);
  const energy = typeof body.energy === "string" ? body.energy.trim().toLowerCase() : "";
  const note = normalizeNote(body.note);

  if (!isDateString(date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  } else if (isFutureDateString(date)) {
    errors.date = "Check-ins cannot be submitted for future dates.";
  }

  if (!MOOD_VALUES.includes(mood)) {
    errors.mood = "Mood must be great, good, okay, low, or bad.";
  }

  if (!ENERGY_LEVELS.includes(energy)) {
    errors.energy = "Energy must be low, medium, or high.";
  }

  if (note && note.length > 500) {
    errors.note = "Note must be 500 characters or fewer.";
  }

  return {
    value: {
      date,
      mood,
      energy,
      note
    },
    errors
  };
}

function validateCheckinUpdate(body) {
  const errors = {};
  const value = {};

  if (Object.prototype.hasOwnProperty.call(body, "mood")) {
    value.mood = normalizeMood(body.mood);

    if (!MOOD_VALUES.includes(value.mood)) {
      errors.mood = "Mood must be great, good, okay, low, or bad.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "energy")) {
    value.energy = typeof body.energy === "string" ? body.energy.trim().toLowerCase() : "";

    if (!ENERGY_LEVELS.includes(value.energy)) {
      errors.energy = "Energy must be low, medium, or high.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "note")) {
    value.note = normalizeNote(body.note);

    if (value.note && value.note.length > 500) {
      errors.note = "Note must be 500 characters or fewer.";
    }
  }

  if (Object.keys(value).length === 0) {
    errors.body = "At least one check-in field is required.";
  }

  return {
    value,
    errors
  };
}

module.exports = {
  validateCheckinCreate,
  validateCheckinUpdate
};
