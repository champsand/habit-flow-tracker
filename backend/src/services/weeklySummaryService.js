const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { getCurrentWeekRange, getWeekRange } = require("../utils/date");
const { assertUuid } = require("../utils/id");
const { normalizeStoredSummary } = require("../models/weeklySummaryModel");
const { buildWeeklySummaryData } = require("../utils/weeklyScoring");
const aiInsightService = require("./aiInsightService");

function getRangeFromWeekDate(weekDate) {
  return weekDate ? getWeekRange(weekDate) : getCurrentWeekRange();
}

async function getCurrentSummary(userId) {
  const range = getCurrentWeekRange();
  const [existingSummary, summaryData] = await Promise.all([
    findSummaryByWeekStart(userId, range.weekStartDate),
    calculateSummaryData(userId, range)
  ]);

  if (existingSummary) {
    return mergeStoredSummaryWithFreshData(existingSummary, summaryData);
  }

  return buildPreviewSummary(userId, range, summaryData);
}

async function getSummaryById(userId, weekId) {
  assertUuid(weekId, "Weekly summary id");

  const summary = await prisma.weeklySummary.findFirst({
    where: {
      id: weekId,
      userId
    }
  });

  if (!summary) {
    throw new ApiError(404, "Weekly summary not found.");
  }

  const summaryData = await calculateSummaryDataForStoredSummary(userId, summary);
  return mergeStoredSummaryWithFreshData(summary, summaryData);
}

async function generateSummary(userId, options = {}) {
  const range = getRangeFromWeekDate(options.weekDate);
  const summaryData = await calculateSummaryData(userId, range);
  const aiResult = await aiInsightService.generateInsight(summaryData, summaryData.checkins);

  const summary = await prisma.weeklySummary.upsert({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: range.weekStartDate
      }
    },
    create: {
      userId,
      weekStartDate: range.weekStartDate,
      weekEndDate: range.weekEndDate,
      rankingData: summaryData.rankingData,
      progressData: summaryData.progressData,
      topHabit: summaryData.topHabit,
      habitsNeedingAttention: summaryData.habitsNeedingAttention,
      insightText: aiResult.insightText,
      recommendationText: aiResult.recommendationText,
      status: "generated",
      generatedAt: new Date()
    },
    update: {
      weekEndDate: range.weekEndDate,
      rankingData: summaryData.rankingData,
      progressData: summaryData.progressData,
      topHabit: summaryData.topHabit,
      habitsNeedingAttention: summaryData.habitsNeedingAttention,
      insightText: aiResult.insightText,
      recommendationText: aiResult.recommendationText,
      status: "generated",
      generatedAt: new Date()
    }
  });

  return mergeStoredSummaryWithFreshData(summary, summaryData);
}

async function generateInsightPreview(userId, options = {}) {
  const range = getRangeFromWeekDate(options.weekDate);
  const summaryData = await calculateSummaryData(userId, range);
  const aiResult = await aiInsightService.generateInsight(summaryData, summaryData.checkins);

  return {
    insightText: aiResult.insightText,
    recommendationText: aiResult.recommendationText,
    provider: aiResult.provider,
    model: aiResult.model,
    providerConfigured: aiResult.providerConfigured,
    fallback: aiResult.fallback || false,
    reason: aiResult.reason,
    weekStartDate: range.weekStart,
    weekEndDate: range.weekEnd
  };
}

function buildPreviewSummary(userId, range, summaryData) {
  return {
    id: null,
    userId,
    weekStartDate: range.weekStart,
    weekEndDate: range.weekEnd,
    ...pickFreshSummaryFields(summaryData),
    insightText: null,
    recommendationText: null,
    status: "preview",
    isInsightStale: false,
    generatedAt: null,
    createdAt: null,
    updatedAt: null
  };
}

function mergeStoredSummaryWithFreshData(storedSummary, summaryData) {
  return {
    ...normalizeStoredSummary(storedSummary),
    ...pickFreshSummaryFields(summaryData),
    isInsightStale: isStoredInsightStale(storedSummary, summaryData)
  };
}

function pickFreshSummaryFields(summaryData) {
  return {
    rankingData: summaryData.rankingData,
    progressData: summaryData.progressData,
    topHabit: summaryData.topHabit,
    habitsNeedingAttention: summaryData.habitsNeedingAttention,
    checkinCount: summaryData.checkinCount,
    targetsAchieved: summaryData.targetsAchieved,
    totalHabits: summaryData.totalHabits,
    readableSummary: summaryData.readableSummary
  };
}

function isStoredInsightStale(storedSummary, summaryData) {
  if (!storedSummary?.generatedAt) {
    return false;
  }

  const generatedAt = new Date(storedSummary.generatedAt).getTime();
  if (!Number.isFinite(generatedAt)) {
    return false;
  }

  return getMaxActivityTimestamp(summaryData) > generatedAt;
}

function getMaxActivityTimestamp(summaryData) {
  const habitsForStaleness = summaryData.allHabitsForStaleness || summaryData.habits;
  return [...habitsForStaleness, ...summaryData.habitLogs, ...summaryData.checkins].reduce((latest, item) => {
    const timestamps = [item.createdAt, item.updatedAt].filter(Boolean).map((value) => new Date(value).getTime());
    const itemLatest = Math.max(0, ...timestamps.filter(Number.isFinite));
    return Math.max(latest, itemLatest);
  }, 0);
}

async function calculateSummaryDataForStoredSummary(userId, storedSummary) {
  return calculateSummaryData(userId, getRangeFromWeekDate(storedSummary.weekStartDate));
}

async function calculateSummaryData(userId, range) {
  const [habits, allHabitsForStaleness, habitLogs, checkins] = await Promise.all([
    prisma.habit.findMany({
      where: {
        userId,
        isActive: true
      }
    }),
    prisma.habit.findMany({
      where: {
        userId
      }
    }),
    prisma.habitLog.findMany({
      where: {
        userId,
        date: {
          gte: range.weekStartDate,
          lte: range.weekEndDate
        }
      }
    }),
    prisma.dailyCheckin.findMany({
      where: {
        userId,
        date: {
          gte: range.weekStartDate,
          lte: range.weekEndDate
        }
      }
    })
  ]);

  return {
    ...buildWeeklySummaryData({
      habits,
      habitLogs,
      checkins,
      weekStart: range.weekStart,
      weekEnd: range.weekEnd
    }),
    habits,
    allHabitsForStaleness,
    habitLogs,
    checkins
  };
}

async function findSummaryByWeekStart(userId, weekStartDate) {
  return prisma.weeklySummary.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate
      }
    }
  });
}

module.exports = {
  getCurrentSummary,
  getSummaryById,
  generateSummary,
  generateInsightPreview,
  calculateSummaryData
};
