process.env.JWT_SECRET = "test-secret";
process.env.GEMINI_API_KEY = "";
require("dotenv").config();

const assert = require("assert");
const test = require("node:test");

const dbTest = process.env.RUN_DB_TESTS === "true" && process.env.DATABASE_URL ? test : test.skip;

dbTest("database persists auth, habits, logs, check-ins, weekly summaries, and enforces ownership", async (t) => {
  const prisma = require("../config/prisma");
  const authService = require("../services/authService");
  const habitService = require("../services/habitService");
  const habitLogService = require("../services/habitLogService");
  const checkinService = require("../services/checkinService");
  const weeklySummaryService = require("../services/weeklySummaryService");
  const { getCurrentWeekRange, getServerDateString } = require("../utils/date");

  const unique = Date.now();
  const primaryEmail = `db-primary-${unique}@example.com`;
  const otherEmail = `db-other-${unique}@example.com`;

  t.after(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [primaryEmail, otherEmail]
        }
      }
    });
    await prisma.$disconnect();
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [primaryEmail, otherEmail]
      }
    }
  });

  const registration = await authService.register({
    name: "DB Primary",
    email: primaryEmail,
    password: "password123"
  });
  const otherRegistration = await authService.register({
    name: "DB Other",
    email: otherEmail,
    password: "password123"
  });

  const login = await authService.login({
    email: primaryEmail,
    password: "password123"
  });

  assert.equal(login.user.email, primaryEmail);
  assert.ok(login.token);

  const habit = await habitService.createHabit(registration.user.id, {
    name: "Study",
    type: "frequency",
    category: "good",
    weeklyTarget: 3,
    isActive: true
  });

  const today = getServerDateString();
  const log = await habitLogService.createHabitLog(registration.user.id, {
    habitId: habit.id,
    date: today,
    amount: 1,
    note: "Read one chapter"
  });
  const checkin = await checkinService.createCheckin(registration.user.id, {
    date: today,
    mood: "good",
    energy: "medium",
    note: "Good study block"
  });
  const weeklySummary = await weeklySummaryService.generateSummary(registration.user.id, {
    weekDate: getCurrentWeekRange().weekStart
  });

  assert.equal(log.habitId, habit.id);
  assert.equal(checkin.date, today);
  assert.ok(weeklySummary.id);
  assert.equal(weeklySummary.status, "generated");

  await assert.rejects(
    () => habitService.getHabit(otherRegistration.user.id, habit.id),
    /Habit not found/
  );

  const persistedUser = await prisma.user.findUnique({
    where: {
      email: primaryEmail
    },
    include: {
      habits: true,
      habitLogs: true,
      dailyCheckins: true,
      weeklySummaries: true
    }
  });

  assert.ok(persistedUser);
  assert.equal(persistedUser.habits.length, 1);
  assert.equal(persistedUser.habitLogs.length, 1);
  assert.equal(persistedUser.dailyCheckins.length, 1);
  assert.equal(persistedUser.weeklySummaries.length, 1);
});
