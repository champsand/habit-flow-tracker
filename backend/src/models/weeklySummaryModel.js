const { toDateString } = require("../utils/date");

function toIsoStringOrNull(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeStoredSummary(summary) {
  if (!summary) {
    return null;
  }

  return {
    id: summary.id,
    userId: summary.userId,
    weekStartDate: toDateString(summary.weekStartDate),
    weekEndDate: toDateString(summary.weekEndDate),
    rankingData: summary.rankingData,
    progressData: summary.progressData,
    topHabit: summary.topHabit,
    habitsNeedingAttention: summary.habitsNeedingAttention,
    insightText: summary.insightText,
    recommendationText: summary.recommendationText,
    status: summary.status,
    generatedAt: toIsoStringOrNull(summary.generatedAt),
    createdAt: toIsoStringOrNull(summary.createdAt),
    updatedAt: toIsoStringOrNull(summary.updatedAt)
  };
}

module.exports = {
  normalizeStoredSummary
};
