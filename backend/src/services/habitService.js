const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { assertUuid } = require("../utils/id");
const { toHabitResponse } = require("../models/habitModel");

async function createHabit(userId, data) {
  const habitData = normalizeBadHabitType(data);
  assertWeeklyTargetAllowed(habitData);
  const habit = await prisma.habit.create({
    data: {
      ...habitData,
      userId
    }
  });

  return toHabitResponse(habit);
}

async function listHabits(userId) {
  const habits = await prisma.habit.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return habits.map(toHabitResponse);
}

async function getHabit(userId, habitId) {
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

  return toHabitResponse(habit);
}

async function updateHabit(userId, habitId, data) {
  assertUuid(habitId, "Habit id");
  const existingHabit = await getHabit(userId, habitId);
  const habitData = normalizeBadHabitType(data, existingHabit);
  const nextHabit = {
    ...existingHabit,
    ...habitData
  };
  assertWeeklyTargetAllowed(nextHabit);

  const habit = await prisma.habit.update({
    where: {
      id: habitId
    },
    data: habitData
  });

  return toHabitResponse(habit);
}

async function deleteHabit(userId, habitId) {
  assertUuid(habitId, "Habit id");
  await getHabit(userId, habitId);

  await prisma.habit.delete({
    where: {
      id: habitId
    }
  });
}

function normalizeBadHabitType(data, existingHabit = {}) {
  const nextCategory = data.category ?? existingHabit.category;

  if (nextCategory !== "bad") {
    return data;
  }

  return {
    ...data,
    type: "checklist"
  };
}

function assertWeeklyTargetAllowed(habit) {
  const weeklyTarget = Number(habit.weeklyTarget);
  const isDayBasedTarget = habit.category === "bad" || (habit.category === "good" && habit.type === "checklist");

  if (!Number.isInteger(weeklyTarget) || weeklyTarget < 1) {
    throw new ApiError(400, "Validation failed.", {
      weeklyTarget: "Weekly target must be a positive integer."
    });
  }

  if (isDayBasedTarget && weeklyTarget > 7) {
    throw new ApiError(400, "Validation failed.", {
      weeklyTarget: "Day-based weekly targets must be between 1 and 7."
    });
  }

  if (!isDayBasedTarget && weeklyTarget > 10000) {
    throw new ApiError(400, "Validation failed.", {
      weeklyTarget: "Weekly target must be a positive integer up to 10000."
    });
  }
}

module.exports = {
  createHabit,
  listHabits,
  getHabit,
  updateHabit,
  deleteHabit
};
