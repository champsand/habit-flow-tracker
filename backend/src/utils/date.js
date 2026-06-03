function isDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toDateOnly(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getConfiguredTimeZone() {
  return process.env.APP_TIME_ZONE || "Asia/Jakarta";
}

function getDatePartsInTimeZone(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    return {
      year: parts.find((part) => part.type === "year")?.value,
      month: parts.find((part) => part.type === "month")?.value,
      day: parts.find((part) => part.type === "day")?.value
    };
  } catch {
    return getDatePartsInTimeZone(date, "UTC");
  }
}

function getServerDateString(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  const parts = getDatePartsInTimeZone(date, getConfiguredTimeZone());
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isTodayOrYesterday(value) {
  return value === getServerDateString() || value === getServerDateString(-1);
}

function isFutureDateString(value) {
  return isDateString(value) && value > getServerDateString();
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWeekRange(date = new Date()) {
  const baseDate = typeof date === "string" ? toDateOnly(date) : date;
  const utcDate = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));
  const day = utcDate.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const weekStartDate = addDays(utcDate, -daysSinceMonday);
  const weekEndDate = addDays(weekStartDate, 6);

  return {
    weekStartDate,
    weekEndDate,
    weekStart: toDateString(weekStartDate),
    weekEnd: toDateString(weekEndDate)
  };
}

function getCurrentWeekRange() {
  return getWeekRange(getServerDateString());
}

module.exports = {
  isDateString,
  toDateOnly,
  toDateString,
  getServerDateString,
  isTodayOrYesterday,
  isFutureDateString,
  addDays,
  getWeekRange,
  getCurrentWeekRange
};
