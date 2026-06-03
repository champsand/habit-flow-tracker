const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { toHabitLogResponse } = require("../models/habitLogModel");
const { toDateOnly } = require("../utils/date");
const { assertUuid } = require("../utils/id");

async function getOwnedHabit(userId, habitId) {
  assertUuid(habitId, "Habit id");

  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId
    }
  });

  if (!habit) {
    throw new ApiError(404, "Habit not found.");
  }

  return habit;
}

function validateAmountForHabit(habit, amount) {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new ApiError(400, "Log amount must be a non-negative integer.");
  }

  if (habit.type === "checklist" && ![0, 1].includes(amount)) {
    throw new ApiError(400, "Checklist habit amount must be 1 for done or 0 for not done.");
  }

  if (habit.type === "frequency" && amount <= 0) {
    throw new ApiError(400, "Frequency habit amount must be greater than zero.");
  }

  if (habit.type === "duration" && amount <= 0) {
    throw new ApiError(400, "Duration habit amount must be greater than zero minutes.");
  }
}

function validateBadHabitUpdate(existingLog, data) {
  if (existingLog.habit.category !== "bad" || !Object.prototype.hasOwnProperty.call(data, "amount")) {
    return;
  }

  if (data.amount !== 1) {
    throw new ApiError(400, "Bad habit avoidance logs must keep amount 1.");
  }
}

async function listHabitLogs(userId, filters = {}) {
  const where = {
    userId
  };

  if (filters.habitId) {
    await getOwnedHabit(userId, filters.habitId);
    where.habitId = filters.habitId;
  }

  if (filters.date) {
    where.date = toDateOnly(filters.date);
  } else if (filters.startDate || filters.endDate) {
    where.date = {};

    if (filters.startDate) {
      where.date.gte = toDateOnly(filters.startDate);
    }

    if (filters.endDate) {
      where.date.lte = toDateOnly(filters.endDate);
    }
  }

  const logs = await prisma.habitLog.findMany({
    where,
    orderBy: {
      date: "desc"
    }
  });

  return logs.map(toHabitLogResponse);
}

async function createHabitLog(userId, data) {
  const habit = await getOwnedHabit(userId, data.habitId);

  if (habit.category === "bad") {
    throw new ApiError(400, "Bad habits must be recorded through the avoidance endpoint.");
  }

  validateAmountForHabit(habit, data.amount);
  const logDate = toDateOnly(data.date);

  // Keep one effective log per user/habit/date without a database migration that could fail on existing duplicate rows.
  const log = await prisma.$transaction(async (tx) => {
    await tx.habitLog.deleteMany({
      where: {
        userId,
        habitId: habit.id,
        date: logDate
      }
    });

    return tx.habitLog.create({
      data: {
        userId,
        habitId: habit.id,
        date: logDate,
        amount: data.amount,
        note: data.note
      }
    });
  });

  return toHabitLogResponse(log);
}

async function createAvoidanceLog(userId, data) {
  const habit = await getOwnedHabit(userId, data.habitId);

  if (habit.category !== "bad") {
    throw new ApiError(400, "Avoidance logs can only be recorded for bad habits.");
  }

  const logDate = toDateOnly(data.date);

  // Keep one effective avoidance log per user/habit/date without a risky migration on existing data.
  const log = await prisma.$transaction(async (tx) => {
    await tx.habitLog.deleteMany({
      where: {
        userId,
        habitId: habit.id,
        date: logDate
      }
    });

    return tx.habitLog.create({
      data: {
        userId,
        habitId: habit.id,
        date: logDate,
        amount: 1,
        note: data.note
      }
    });
  });

  return toHabitLogResponse(log);
}

async function replaceLogsForDate(tx, { userId, habitId, date, exceptLogId }) {
  await tx.habitLog.deleteMany({
    where: {
      userId,
      habitId,
      date,
      ...(exceptLogId ? { id: { not: exceptLogId } } : {})
    }
  });
}

async function getHabitLog(userId, logId) {
  assertUuid(logId, "Habit log id");

  const log = await prisma.habitLog.findFirst({
    where: {
      id: logId,
      userId
    }
  });

  if (!log) {
    throw new ApiError(404, "Habit log not found.");
  }

  return toHabitLogResponse(log);
}

async function updateHabitLog(userId, logId, data) {
  assertUuid(logId, "Habit log id");

  const existingLog = await prisma.habitLog.findFirst({
    where: {
      id: logId,
      userId
    },
    include: {
      habit: true
    }
  });

  if (!existingLog) {
    throw new ApiError(404, "Habit log not found.");
  }

  if (Object.prototype.hasOwnProperty.call(data, "amount")) {
    validateBadHabitUpdate(existingLog, data);
    validateAmountForHabit(existingLog.habit, data.amount);
  }

  const updateData = {
    ...data
  };

  if (updateData.date) {
    updateData.date = toDateOnly(updateData.date);
  }

  const log = await prisma.$transaction(async (tx) => {
    if (updateData.date) {
      await replaceLogsForDate(tx, {
        userId,
        habitId: existingLog.habitId,
        date: updateData.date,
        exceptLogId: logId
      });
    }

    return tx.habitLog.update({
      where: {
        id: logId
      },
      data: updateData
    });
  });

  return toHabitLogResponse(log);
}

async function deleteHabitLog(userId, logId) {
  assertUuid(logId, "Habit log id");
  await getHabitLog(userId, logId);

  await prisma.habitLog.delete({
    where: {
      id: logId
    }
  });
}

module.exports = {
  listHabitLogs,
  createHabitLog,
  createAvoidanceLog,
  getHabitLog,
  updateHabitLog,
  deleteHabitLog
};
