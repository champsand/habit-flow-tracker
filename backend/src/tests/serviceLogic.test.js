process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/habit_flow";
process.env.GEMINI_API_KEY = "";

const assert = require("assert");
const test = require("node:test");
const { getCurrentWeekRange } = require("../utils/date");
const { scoreHabit } = require("../utils/weeklyScoring");

const userId = "550e8400-e29b-41d4-a716-446655440000";
const frequencyHabitId = "550e8400-e29b-41d4-a716-446655440001";
const checklistHabitId = "550e8400-e29b-41d4-a716-446655440002";
const badHabitId = "550e8400-e29b-41d4-a716-446655440003";
const durationHabitId = "550e8400-e29b-41d4-a716-446655440004";
const today = "2026-05-25";

function clearModule(modulePath) {
  delete require.cache[require.resolve(modulePath)];
}

function setModuleExport(modulePath, exports) {
  require.cache[require.resolve(modulePath)] = {
    id: require.resolve(modulePath),
    filename: require.resolve(modulePath),
    loaded: true,
    exports
  };
}

function sameDate(left, right) {
  return left instanceof Date && right instanceof Date && left.getTime() === right.getTime();
}

function makeHabitLogPrisma() {
  let nextId = 1;
  const logs = [];
  const habits = new Map([
    [
      frequencyHabitId,
      {
        id: frequencyHabitId,
        userId,
        name: "Workout",
        type: "frequency",
        category: "good",
        weeklyTarget: 10,
        isActive: true
      }
    ],
    [
      checklistHabitId,
      {
        id: checklistHabitId,
        userId,
        name: "Read",
        type: "checklist",
        category: "good",
        weeklyTarget: 5,
        isActive: true
      }
    ],
    [
      durationHabitId,
      {
        id: durationHabitId,
        userId,
        name: "Study",
        type: "duration",
        category: "good",
        weeklyTarget: 120,
        isActive: true
      }
    ],
    [
      badHabitId,
      {
        id: badHabitId,
        userId,
        name: "No sugar",
        type: "checklist",
        category: "bad",
        weeklyTarget: 5,
        isActive: true
      }
    ]
  ]);

  const prisma = {
    habit: {
      async findFirst({ where }) {
        const habit = habits.get(where.id);
        return habit && habit.userId === where.userId ? habit : null;
      }
    },
    habitLog: {
      async deleteMany({ where }) {
        for (let index = logs.length - 1; index >= 0; index -= 1) {
          const log = logs[index];
          const sameLogDate = !where.date || sameDate(log.date, where.date);
          const sameId = !where.id?.not || log.id !== where.id.not;

          if (log.userId === where.userId && log.habitId === where.habitId && sameLogDate && sameId) {
            logs.splice(index, 1);
          }
        }
      },
      async create({ data }) {
        const log = {
          id: `550e8400-e29b-41d4-a716-44665544${String(nextId).padStart(4, "0")}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data
        };
        nextId += 1;
        logs.push(log);
        return log;
      },
      async findFirst({ where, include }) {
        const log = logs.find((item) => item.id === where.id && item.userId === where.userId);
        if (!log) return null;

        return include?.habit ? { ...log, habit: habits.get(log.habitId) } : log;
      },
      async findMany({ where }) {
        return logs.filter((log) => {
          if (log.userId !== where.userId) return false;
          if (where.habitId && log.habitId !== where.habitId) return false;
          if (where.date instanceof Date) return sameDate(log.date, where.date);
          return true;
        });
      },
      async update({ where, data }) {
        const index = logs.findIndex((log) => log.id === where.id);
        if (index === -1) return null;
        logs[index] = {
          ...logs[index],
          ...data,
          updatedAt: new Date()
        };
        return logs[index];
      }
    },
    async $transaction(callback) {
      return callback(prisma);
    }
  };

  return prisma;
}

function loadHabitLogServiceWithPrisma(prisma) {
  clearModule("../services/habitLogService");
  setModuleExport("../config/prisma", prisma);
  return require("../services/habitLogService");
}

function loadHabitServiceWithPrisma(prisma) {
  clearModule("../services/habitService");
  setModuleExport("../config/prisma", prisma);
  return require("../services/habitService");
}

test("habit updates validate final day-based weekly target and normalize bad habit type", async () => {
  const existingHabit = {
    id: badHabitId,
    userId,
    name: "No sugar",
    type: "checklist",
    category: "bad",
    weeklyTarget: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const prisma = {
    habit: {
      async findFirst({ where }) {
        return where.id === badHabitId && where.userId === userId ? existingHabit : null;
      },
      async update({ data }) {
        return {
          ...existingHabit,
          ...data,
          updatedAt: new Date()
        };
      }
    }
  };
  const habitService = loadHabitServiceWithPrisma(prisma);

  await assert.rejects(
    () => habitService.updateHabit(userId, badHabitId, { weeklyTarget: 20 }),
    /Validation failed/
  );

  const updated = await habitService.updateHabit(userId, badHabitId, {
    type: "duration",
    weeklyTarget: 6
  });

  assert.equal(updated.type, "checklist");
  assert.equal(updated.weeklyTarget, 6);
});

test("habit updates reject changing a high-target frequency habit into a bad habit", async () => {
  const existingHabit = {
    id: frequencyHabitId,
    userId,
    name: "Workout",
    type: "frequency",
    category: "good",
    weeklyTarget: 20,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const prisma = {
    habit: {
      async findFirst({ where }) {
        return where.id === frequencyHabitId && where.userId === userId ? existingHabit : null;
      },
      async update({ data }) {
        return {
          ...existingHabit,
          ...data,
          updatedAt: new Date()
        };
      }
    }
  };
  const habitService = loadHabitServiceWithPrisma(prisma);

  await assert.rejects(
    () => habitService.updateHabit(userId, frequencyHabitId, { category: "bad" }),
    /Validation failed/
  );

  const updated = await habitService.updateHabit(userId, frequencyHabitId, {
    type: "duration",
    weeklyTarget: 120
  });

  assert.equal(updated.type, "duration");
  assert.equal(updated.category, "good");
  assert.equal(updated.weeklyTarget, 120);
});

test("habit log create replaces same-day frequency logs instead of duplicating them", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  await habitLogService.createHabitLog(userId, {
    habitId: frequencyHabitId,
    date: today,
    amount: 2,
    note: null
  });
  await habitLogService.createHabitLog(userId, {
    habitId: frequencyHabitId,
    date: today,
    amount: 4,
    note: null
  });

  const logs = await habitLogService.listHabitLogs(userId, { habitId: frequencyHabitId, date: today });

  assert.equal(logs.length, 1);
  assert.equal(logs[0].amount, 4);
  assert.equal(scoreHabit({ type: "frequency", category: "good", weeklyTarget: 10 }, logs).score, 0.4);
});

test("habit log amount validation rejects zero for frequency and duration habits", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  await assert.rejects(
    () => habitLogService.createHabitLog(userId, {
      habitId: frequencyHabitId,
      date: today,
      amount: 0,
      note: null
    }),
    /greater than zero/
  );

  await assert.rejects(
    () => habitLogService.createHabitLog(userId, {
      habitId: durationHabitId,
      date: today,
      amount: 0,
      note: null
    }),
    /greater than zero/
  );
});

test("checklist amount validation allows zero and one but rejects two", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  const notDone = await habitLogService.createHabitLog(userId, {
    habitId: checklistHabitId,
    date: today,
    amount: 0,
    note: null
  });
  const done = await habitLogService.createHabitLog(userId, {
    habitId: checklistHabitId,
    date: today,
    amount: 1,
    note: null
  });

  await assert.rejects(
    () => habitLogService.createHabitLog(userId, {
      habitId: checklistHabitId,
      date: today,
      amount: 2,
      note: null
    }),
    /Checklist habit amount/
  );

  assert.equal(notDone.amount, 0);
  assert.equal(done.amount, 1);
});

test("checklist done then not done leaves one non-completion log for that date", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  await habitLogService.createHabitLog(userId, {
    habitId: checklistHabitId,
    date: today,
    amount: 1,
    note: null
  });
  await habitLogService.createHabitLog(userId, {
    habitId: checklistHabitId,
    date: today,
    amount: 0,
    note: null
  });

  const logs = await habitLogService.listHabitLogs(userId, { habitId: checklistHabitId, date: today });
  const score = scoreHabit({ type: "checklist", category: "good", weeklyTarget: 5 }, logs);

  assert.equal(logs.length, 1);
  assert.equal(logs[0].amount, 0);
  assert.equal(score.progressAmount, 0);
  assert.equal(score.score, 0);
});

test("bad habit avoidance replacement does not duplicate-count the same date", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  await habitLogService.createAvoidanceLog(userId, {
    habitId: badHabitId,
    date: today,
    note: null
  });
  await habitLogService.createAvoidanceLog(userId, {
    habitId: badHabitId,
    date: today,
    note: "Still avoided"
  });

  const logs = await habitLogService.listHabitLogs(userId, { habitId: badHabitId, date: today });
  const score = scoreHabit({ type: "checklist", category: "bad", weeklyTarget: 5 }, logs);

  assert.equal(logs.length, 1);
  assert.equal(logs[0].amount, 1);
  assert.equal(score.progressAmount, 1);
  assert.equal(score.score, 0.2);
});

test("bad habits cannot be recorded through generic habit log creation", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);

  await assert.rejects(
    () => habitLogService.createHabitLog(userId, {
      habitId: badHabitId,
      date: today,
      amount: 1,
      note: null
    }),
    /Bad habits must be recorded through the avoidance endpoint/
  );

  const avoidance = await habitLogService.createAvoidanceLog(userId, {
    habitId: badHabitId,
    date: today,
    note: "Avoided"
  });

  assert.equal(avoidance.amount, 1);
});

test("bad habit log updates cannot change avoidance amount", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);
  const log = await habitLogService.createAvoidanceLog(userId, {
    habitId: badHabitId,
    date: today,
    note: "Avoided"
  });

  await assert.rejects(
    () => habitLogService.updateHabitLog(userId, log.id, { amount: 0 }),
    /Bad habit avoidance logs must keep amount 1/
  );
  await assert.rejects(
    () => habitLogService.updateHabitLog(userId, log.id, { amount: 2 }),
    /Bad habit avoidance logs must keep amount 1/
  );

  const updated = await habitLogService.updateHabitLog(userId, log.id, { note: "Still avoided" });

  assert.equal(updated.amount, 1);
  assert.equal(updated.note, "Still avoided");
});

test("good habit log update still follows normal validation", async () => {
  const prisma = makeHabitLogPrisma();
  const habitLogService = loadHabitLogServiceWithPrisma(prisma);
  const log = await habitLogService.createHabitLog(userId, {
    habitId: frequencyHabitId,
    date: today,
    amount: 2,
    note: null
  });

  const updated = await habitLogService.updateHabitLog(userId, log.id, { amount: 5 });

  assert.equal(updated.amount, 5);
});

function makeWeeklySummaryPrisma(options = {}) {
  const range = getCurrentWeekRange();
  const habits = options.habits || [
    {
      id: frequencyHabitId,
      userId,
      name: "Workout",
      type: "frequency",
      category: "good",
      weeklyTarget: 10,
      isActive: true
    },
    {
      id: badHabitId,
      userId,
      name: "No sugar",
      type: "checklist",
      category: "bad",
      weeklyTarget: 5,
      isActive: true
    }
  ];
  const allHabitsForStaleness = options.allHabitsForStaleness || habits;
  const habitLogs = options.habitLogs || [];
  const checkins = options.checkins || [];
  let storedSummary = options.storedSummary || null;

  return {
    weeklySummary: {
      async findUnique() {
        return storedSummary;
      },
      async findFirst({ where }) {
        return storedSummary && storedSummary.id === where.id && storedSummary.userId === where.userId
          ? storedSummary
          : null;
      },
      async upsert({ create }) {
        storedSummary = {
          id: "550e8400-e29b-41d4-a716-446655440099",
          createdAt: new Date(),
          updatedAt: new Date(),
          ...create
        };
        return storedSummary;
      }
    },
    habit: {
      async findMany({ where }) {
        if (where.isActive === true) {
          return habits.filter((habit) => habit.isActive);
        }

        return allHabitsForStaleness;
      }
    },
    habitLog: {
      async findMany() {
        return habitLogs;
      }
    },
    dailyCheckin: {
      async findMany() {
        return checkins;
      }
    },
    range
  };
}

function loadWeeklySummaryServiceWithMocks(prisma, aiInsightService) {
  clearModule("../services/weeklySummaryService");
  setModuleExport("../config/prisma", prisma);
  setModuleExport("../services/aiInsightService", aiInsightService);
  return require("../services/weeklySummaryService");
}

test("current weekly summary preview calculates fresh progress and does not call Gemini", async () => {
  let aiCalls = 0;
  const prisma = makeWeeklySummaryPrisma({
    habitLogs: [
      {
        id: "550e8400-e29b-41d4-a716-446655440091",
        userId,
        habitId: frequencyHabitId,
        date: new Date(`${today}T00:00:00.000Z`),
        amount: 4
      }
    ],
    checkins: [{ id: "550e8400-e29b-41d4-a716-446655440092" }]
  });
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(prisma, {
    async generateInsight() {
      aiCalls += 1;
      return {
        insightText: "AI",
        recommendationText: "Recommendation"
      };
    }
  });

  const summary = await weeklySummaryService.getCurrentSummary(userId);

  assert.equal(aiCalls, 0);
  assert.equal(summary.status, "preview");
  assert.equal(summary.insightText, null);
  assert.equal(summary.recommendationText, null);
  assert.equal(summary.checkinCount, 1);
  assert.equal(summary.totalHabits, 2);
  assert.equal(summary.progressData.find((item) => item.habitId === frequencyHabitId).progressAmount, 4);
});

test("current generated weekly summary keeps AI text but refreshes stale progress", async () => {
  let aiCalls = 0;
  const range = getCurrentWeekRange();
  const generatedAt = new Date("2026-05-25T08:00:00.000Z");
  const prisma = makeWeeklySummaryPrisma({
    storedSummary: {
      id: "550e8400-e29b-41d4-a716-446655440099",
      userId,
      weekStartDate: range.weekStartDate,
      weekEndDate: range.weekEndDate,
      rankingData: [],
      progressData: [
        {
          habitId: frequencyHabitId,
          progressAmount: 1,
          score: 0.1
        }
      ],
      topHabit: null,
      habitsNeedingAttention: [],
      insightText: "Stored insight",
      recommendationText: "Stored recommendation",
      status: "generated",
      generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt
    },
    habitLogs: [
      {
        id: "550e8400-e29b-41d4-a716-446655440093",
        userId,
        habitId: frequencyHabitId,
        date: new Date(`${today}T00:00:00.000Z`),
        amount: 10,
        createdAt: new Date("2026-05-25T09:00:00.000Z"),
        updatedAt: new Date("2026-05-25T09:00:00.000Z")
      }
    ],
    checkins: [{ id: "550e8400-e29b-41d4-a716-446655440095", createdAt: generatedAt, updatedAt: generatedAt }]
  });
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(prisma, {
    async generateInsight() {
      aiCalls += 1;
      return {
        insightText: "Fresh AI",
        recommendationText: "Fresh recommendation"
      };
    }
  });

  const summary = await weeklySummaryService.getCurrentSummary(userId);

  assert.equal(aiCalls, 0);
  assert.equal(summary.status, "generated");
  assert.equal(summary.insightText, "Stored insight");
  assert.equal(summary.recommendationText, "Stored recommendation");
  assert.equal(summary.progressData.find((item) => item.habitId === frequencyHabitId).progressAmount, 10);
  assert.equal(summary.rankingData[0].habitId, frequencyHabitId);
  assert.equal(summary.checkinCount, 1);
  assert.equal(summary.targetsAchieved, 1);
  assert.equal(summary.totalHabits, 2);
  assert.ok(summary.readableSummary.includes("1/2"));
  assert.equal(summary.isInsightStale, true);
});

test("current generated weekly summary is not stale without newer activity", async () => {
  const range = getCurrentWeekRange();
  const generatedAt = new Date("2026-05-25T10:00:00.000Z");
  const prisma = makeWeeklySummaryPrisma({
    storedSummary: {
      id: "550e8400-e29b-41d4-a716-446655440099",
      userId,
      weekStartDate: range.weekStartDate,
      weekEndDate: range.weekEndDate,
      rankingData: [],
      progressData: [],
      topHabit: null,
      habitsNeedingAttention: [],
      insightText: "Stored insight",
      recommendationText: "Stored recommendation",
      status: "generated",
      generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt
    },
    habitLogs: [
      {
        id: "550e8400-e29b-41d4-a716-446655440096",
        userId,
        habitId: frequencyHabitId,
        date: new Date(`${today}T00:00:00.000Z`),
        amount: 3,
        createdAt: new Date("2026-05-25T09:00:00.000Z"),
        updatedAt: new Date("2026-05-25T09:00:00.000Z")
      }
    ]
  });
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(prisma, {
    async generateInsight() {
      throw new Error("Gemini should not be called.");
    }
  });

  const summary = await weeklySummaryService.getCurrentSummary(userId);

  assert.equal(summary.isInsightStale, false);
});

test("summary by id keeps stored AI text but refreshes runtime fields without Gemini", async () => {
  const range = getCurrentWeekRange();
  const generatedAt = new Date("2026-05-25T08:00:00.000Z");
  const storedSummaryId = "550e8400-e29b-41d4-a716-446655440099";
  let aiCalls = 0;
  const prisma = makeWeeklySummaryPrisma({
    storedSummary: {
      id: storedSummaryId,
      userId,
      weekStartDate: range.weekStartDate,
      weekEndDate: range.weekEndDate,
      rankingData: [],
      progressData: [
        {
          habitId: frequencyHabitId,
          progressAmount: 1,
          score: 0.1
        }
      ],
      topHabit: null,
      habitsNeedingAttention: [],
      insightText: "Stored insight",
      recommendationText: "Stored recommendation",
      status: "generated",
      generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt
    },
    habitLogs: [
      {
        id: "550e8400-e29b-41d4-a716-446655440097",
        userId,
        habitId: frequencyHabitId,
        date: range.weekStartDate,
        amount: 9,
        createdAt: new Date("2026-05-25T09:00:00.000Z"),
        updatedAt: new Date("2026-05-25T09:00:00.000Z")
      }
    ],
    checkins: [{ id: "550e8400-e29b-41d4-a716-446655440098", createdAt: generatedAt, updatedAt: generatedAt }]
  });
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(prisma, {
    async generateInsight() {
      aiCalls += 1;
      return {
        insightText: "Fresh AI",
        recommendationText: "Fresh recommendation"
      };
    }
  });

  const summary = await weeklySummaryService.getSummaryById(userId, storedSummaryId);

  assert.equal(aiCalls, 0);
  assert.equal(summary.id, storedSummaryId);
  assert.equal(summary.status, "generated");
  assert.equal(summary.insightText, "Stored insight");
  assert.equal(summary.recommendationText, "Stored recommendation");
  assert.equal(summary.progressData.find((item) => item.habitId === frequencyHabitId).progressAmount, 9);
  assert.equal(summary.rankingData[0].habitId, frequencyHabitId);
  assert.equal(summary.checkinCount, 1);
  assert.equal(summary.targetsAchieved, 0);
  assert.equal(summary.totalHabits, 2);
  assert.ok(summary.readableSummary.includes("0/2"));
  assert.equal(summary.isInsightStale, true);
});

test("generated weekly summary becomes stale when any habit is updated after generation", async () => {
  const range = getCurrentWeekRange();
  const generatedAt = new Date("2026-05-25T08:00:00.000Z");
  const inactiveHabit = {
    id: checklistHabitId,
    userId,
    name: "Paused reading",
    type: "checklist",
    category: "good",
    weeklyTarget: 4,
    isActive: false,
    createdAt: new Date("2026-05-20T08:00:00.000Z"),
    updatedAt: new Date("2026-05-25T09:00:00.000Z")
  };
  const activeHabit = {
    id: frequencyHabitId,
    userId,
    name: "Workout",
    type: "frequency",
    category: "good",
    weeklyTarget: 10,
    isActive: true,
    createdAt: new Date("2026-05-20T08:00:00.000Z"),
    updatedAt: new Date("2026-05-25T07:00:00.000Z")
  };
  const prisma = makeWeeklySummaryPrisma({
    habits: [activeHabit],
    allHabitsForStaleness: [activeHabit, inactiveHabit],
    storedSummary: {
      id: "550e8400-e29b-41d4-a716-446655440099",
      userId,
      weekStartDate: range.weekStartDate,
      weekEndDate: range.weekEndDate,
      rankingData: [],
      progressData: [],
      topHabit: null,
      habitsNeedingAttention: [],
      insightText: "Stored insight",
      recommendationText: "Stored recommendation",
      status: "generated",
      generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt
    }
  });
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(prisma, {
    async generateInsight() {
      throw new Error("Gemini should not be called.");
    }
  });

  const summary = await weeklySummaryService.getCurrentSummary(userId);

  assert.equal(summary.totalHabits, 1);
  assert.equal(summary.progressData.some((item) => item.habitId === inactiveHabit.id), false);
  assert.equal(summary.isInsightStale, true);
});

test("generated weekly summary calls Gemini and saves latest progress", async () => {
  let aiCalls = 0;
  const weeklySummaryService = loadWeeklySummaryServiceWithMocks(makeWeeklySummaryPrisma({
    habitLogs: [
      {
        id: "550e8400-e29b-41d4-a716-446655440094",
        userId,
        habitId: frequencyHabitId,
        date: new Date(`${today}T00:00:00.000Z`),
        amount: 8
      }
    ]
  }), {
    async generateInsight() {
      aiCalls += 1;
      return {
        insightText: "Generated insight",
        recommendationText: "Generated recommendation"
      };
    }
  });

  const summary = await weeklySummaryService.generateSummary(userId, { weekDate: today });

  assert.equal(aiCalls, 1);
  assert.equal(summary.status, "generated");
  assert.equal(summary.insightText, "Generated insight");
  assert.equal(summary.recommendationText, "Generated recommendation");
  assert.equal(summary.progressData.find((item) => item.habitId === frequencyHabitId).progressAmount, 8);
  assert.equal(summary.isInsightStale, false);
});

test("weekly summary model normalizes timestamps to ISO strings or null", () => {
  const { normalizeStoredSummary } = require("../models/weeklySummaryModel");
  const generatedAt = new Date("2026-05-25T08:00:00.000Z");
  const createdAt = new Date("2026-05-25T08:01:00.000Z");

  const summary = normalizeStoredSummary({
    id: "550e8400-e29b-41d4-a716-446655440099",
    userId,
    weekStartDate: new Date("2026-05-25T00:00:00.000Z"),
    weekEndDate: new Date("2026-05-31T00:00:00.000Z"),
    rankingData: [],
    progressData: [],
    topHabit: null,
    habitsNeedingAttention: [],
    insightText: "Stored insight",
    recommendationText: "Stored recommendation",
    status: "generated",
    generatedAt,
    createdAt,
    updatedAt: null
  });

  assert.equal(summary.weekStartDate, "2026-05-25");
  assert.equal(summary.weekEndDate, "2026-05-31");
  assert.equal(summary.generatedAt, generatedAt.toISOString());
  assert.equal(summary.createdAt, createdAt.toISOString());
  assert.equal(summary.updatedAt, null);
});
