process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/habit_flow";
process.env.GEMINI_API_KEY = "";

const assert = require("assert");
const test = require("node:test");
const { buildWeeklySummaryData, rankHabitProgress, scoreHabit } = require("../utils/weeklyScoring");
const { getWeekRange } = require("../utils/date");
const aiInsightService = require("../services/aiInsightService");

test("week range always follows Monday to Sunday", () => {
  const range = getWeekRange("2026-05-01");

  assert.equal(range.weekStart, "2026-04-27");
  assert.equal(range.weekEnd, "2026-05-03");
});

test("scores habits using normalized 0-1 rules", () => {
  const checklist = scoreHabit(
    { type: "checklist", category: "good", weeklyTarget: 4 },
    [{ amount: 1, date: new Date("2026-04-27T00:00:00.000Z") }]
  );
  const frequency = scoreHabit({ type: "frequency", category: "good", weeklyTarget: 10 }, [{ amount: 7 }]);
  const duration = scoreHabit({ type: "duration", category: "good", weeklyTarget: 120 }, [{ amount: 60 }]);
  const badHabit = scoreHabit(
    { type: "checklist", category: "bad", weeklyTarget: 5 },
    [
      { amount: 1, date: new Date("2026-04-27T00:00:00.000Z") },
      { amount: 1, date: new Date("2026-04-28T00:00:00.000Z") }
    ]
  );

  assert.equal(checklist.score, 1 / 4);
  assert.equal(checklist.progressLabel, "1/4 days");
  assert.equal(frequency.score, 0.7);
  assert.equal(duration.score, 0.5);
  assert.equal(badHabit.score, 2 / 5);
  assert.equal(badHabit.progressLabel, "2/5 avoidance days");
});

test("ranks habits by normalized score from highest to lowest", () => {
  const ranking = rankHabitProgress([
    { name: "B", score: 0.2 },
    { name: "A", score: 1 },
    { name: "C", score: 0.7 }
  ]);

  assert.deepEqual(
    ranking.map((item) => item.name),
    ["A", "C", "B"]
  );
});

test("builds a default weekly summary when no data exists", () => {
  const summary = buildWeeklySummaryData({
    habits: [],
    habitLogs: [],
    checkins: [],
    weekStart: "2026-04-27",
    weekEnd: "2026-05-03"
  });

  assert.equal(summary.totalHabits, 0);
  assert.deepEqual(summary.rankingData, []);
  assert.equal(summary.topHabit, null);
  assert.match(summary.readableSummary, /No habits/);
});

test("weekly summary chooses the lowest incomplete habit for needs attention", () => {
  const habits = [
    { id: "habit-a", name: "Something else", type: "frequency", category: "good", weeklyTarget: 12, isActive: true },
    { id: "habit-b", name: "Something longer", type: "duration", category: "good", weeklyTarget: 180, isActive: true },
    { id: "habit-c", name: "Something bad", type: "checklist", category: "bad", weeklyTarget: 7, isActive: true },
    { id: "habit-d", name: "Something right", type: "checklist", category: "good", weeklyTarget: 5, isActive: true }
  ];
  const summary = buildWeeklySummaryData({
    habits,
    habitLogs: [
      { habitId: "habit-a", amount: 4, date: "2026-04-27" },
      { habitId: "habit-b", amount: 30, date: "2026-04-27" },
      { habitId: "habit-c", amount: 1, date: "2026-04-27" }
    ],
    checkins: [],
    weekStart: "2026-04-27",
    weekEnd: "2026-05-03"
  });

  assert.equal(summary.topHabit.name, "Something else");
  assert.equal(summary.habitsNeedingAttention[0].name, "Something right");
  assert.notEqual(summary.habitsNeedingAttention[0].habitId, summary.topHabit.habitId);
});

test("Gemini insight falls back cleanly when API key is missing", async () => {
  const summary = buildWeeklySummaryData({
    habits: [],
    habitLogs: [],
    checkins: [],
    weekStart: "2026-04-27",
    weekEnd: "2026-05-03"
  });
  const insight = await aiInsightService.generateInsight(summary, []);

  assert.equal(insight.providerConfigured, false);
  assert.equal(insight.provider, "gemini");
  assert.equal(insight.fallback, true);
  assert.match(insight.reason, /GEMINI_API_KEY/);
  assert.ok(insight.insightText);
  assert.ok(insight.recommendationText);
  assert.ok(insight.input);
});
