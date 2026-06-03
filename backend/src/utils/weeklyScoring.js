function clampScore(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(value, 1);
}

function getUniquePositiveLogDays(logs) {
  return new Set(logs.filter((log) => log.amount > 0).map((log) => toDateKey(log.date))).size;
}

function getTotalAmount(logs) {
  return logs.reduce((total, log) => total + log.amount, 0);
}

function getSafeWeeklyTarget(habit) {
  const weeklyTarget = Number(habit.weeklyTarget);
  return Number.isInteger(weeklyTarget) && weeklyTarget > 0 ? weeklyTarget : 1;
}

function toDateKey(date) {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }

  return String(date).slice(0, 10);
}

function scoreHabit(habit, logs) {
  const weeklyTarget = getSafeWeeklyTarget(habit);

  if (habit.category === "bad") {
    const avoidedDays = getUniquePositiveLogDays(logs);

    return {
      progressAmount: avoidedDays,
      progressLabel: `${avoidedDays}/${weeklyTarget} avoidance days`,
      score: clampScore(avoidedDays / weeklyTarget),
      targetAchieved: avoidedDays >= weeklyTarget
    };
  }

  if (habit.type === "checklist") {
    const completedDays = getUniquePositiveLogDays(logs);

    return {
      progressAmount: completedDays,
      progressLabel: `${completedDays}/${weeklyTarget} days`,
      score: clampScore(completedDays / weeklyTarget),
      targetAchieved: completedDays >= weeklyTarget
    };
  }

  const totalAmount = getTotalAmount(logs);
  const unit = habit.type === "duration" ? "minutes" : "times";

  return {
    progressAmount: totalAmount,
    progressLabel: `${totalAmount}/${weeklyTarget} ${unit}`,
    score: clampScore(totalAmount / weeklyTarget),
    targetAchieved: totalAmount >= weeklyTarget
  };
}

function buildHabitProgress(habits, habitLogs) {
  return habits.map((habit) => {
    const logs = habitLogs.filter((log) => log.habitId === habit.id);
    const result = scoreHabit(habit, logs);

    return {
      habitId: habit.id,
      name: habit.name,
      type: habit.type,
      category: habit.category,
      weeklyTarget: habit.weeklyTarget,
      isActive: habit.isActive,
      logCount: logs.length,
      ...result
    };
  });
}

function rankHabitProgress(progressItems) {
  return [...progressItems].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.name.localeCompare(b.name);
  });
}

function rankIncompleteHabitsByLowestProgress(progressItems) {
  return progressItems.filter((item) => !item.targetAchieved).sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }

    return a.name.localeCompare(b.name);
  });
}

function buildWeeklySummaryData({ habits, habitLogs, checkins, weekStart, weekEnd }) {
  const progressData = buildHabitProgress(habits, habitLogs);
  const rankingData = rankHabitProgress(progressData);
  const topHabit = rankingData[0] || null;
  const habitsNeedingAttention = rankIncompleteHabitsByLowestProgress(progressData);
  const targetsAchieved = progressData.filter((item) => item.targetAchieved).length;

  return {
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
    progressData,
    rankingData,
    topHabit,
    habitsNeedingAttention,
    checkinCount: checkins.length,
    targetsAchieved,
    totalHabits: habits.length,
    readableSummary: buildReadableSummary({
      totalHabits: habits.length,
      targetsAchieved,
      topHabit,
      habitsNeedingAttention
    })
  };
}

function buildReadableSummary({ totalHabits, targetsAchieved, topHabit, habitsNeedingAttention }) {
  if (totalHabits === 0) {
    return "No habits were tracked this week yet.";
  }

  const topHabitText = topHabit ? `${topHabit.name} was your strongest habit this week.` : "No top habit was identified yet.";
  const attentionText =
    habitsNeedingAttention.length > 0
      ? `${habitsNeedingAttention.length} habit(s) still need attention.`
      : "All tracked habits reached their weekly target.";

  return `${targetsAchieved}/${totalHabits} habit target(s) were reached. ${topHabitText} ${attentionText}`;
}

module.exports = {
  buildHabitProgress,
  rankHabitProgress,
  buildWeeklySummaryData,
  scoreHabit
};
