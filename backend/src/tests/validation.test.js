const assert = require("assert");
const test = require("node:test");
const { validateHabitCreate, validateHabitUpdate } = require("../schemas/habitSchemas");
const { validateHabitLogCreate } = require("../schemas/habitLogSchemas");
const { validateCheckinCreate, validateCheckinUpdate } = require("../schemas/checkinSchemas");
const { validateRegister } = require("../schemas/authSchemas");
const { getServerDateString, toDateOnly, toDateString } = require("../utils/date");
const { assertUuid, isUuid } = require("../utils/id");

test("register validation rejects whitespace-only passwords without trimming valid passwords", () => {
  const whitespace = validateRegister({
    name: "Alex Carter",
    email: "alex@example.com",
    password: "        "
  });
  const valid = validateRegister({
    name: "Alex Carter",
    email: "alex@example.com",
    password: " password123 "
  });

  assert.ok(whitespace.errors.password);
  assert.deepEqual(valid.errors, {});
  assert.equal(valid.value.password, " password123 ");
});

test("habit validation accepts a complete habit payload", () => {
  const result = validateHabitCreate({
    name: "Study",
    type: "frequency",
    category: "good",
    weeklyTarget: 5
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.name, "Study");
});

test("habit validation rejects invalid enum values", () => {
  const result = validateHabitCreate({
    name: "Study",
    type: "streak",
    category: "neutral",
    weeklyTarget: 5
  });

  assert.ok(result.errors.type);
  assert.ok(result.errors.category);
});

test("habit validation limits day-based weekly targets to seven", () => {
  const checklist = validateHabitCreate({
    name: "Read",
    type: "checklist",
    category: "good",
    weeklyTarget: 8
  });
  const badHabit = validateHabitCreate({
    name: "Avoid scrolling",
    type: "duration",
    category: "bad",
    weeklyTarget: 5
  });
  const badHabitWithoutType = validateHabitCreate({
    name: "Avoid sugar",
    category: "bad",
    weeklyTarget: 5
  });

  assert.ok(checklist.errors.weeklyTarget);
  assert.deepEqual(badHabit.errors, {});
  assert.equal(badHabit.value.type, "checklist");
  assert.deepEqual(badHabitWithoutType.errors, {});
  assert.equal(badHabitWithoutType.value.type, "checklist");
});

test("habit update validation accepts partial payloads before service-level final target checks", () => {
  const result = validateHabitUpdate({
    weeklyTarget: 20
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.weeklyTarget, 20);
});

test("habit log validation requires a valid date and numeric amount", () => {
  const result = validateHabitLogCreate({
    habitId: "habit-id",
    date: "2026-99-99",
    amount: "done"
  });

  assert.ok(result.errors.date);
  assert.ok(result.errors.amount);
});

test("habit log validation rejects future dates", () => {
  const future = toDateOnly(getServerDateString());
  future.setUTCDate(future.getUTCDate() + 1);
  const result = validateHabitLogCreate({
    habitId: "habit-id",
    date: toDateString(future),
    amount: 1
  });

  assert.ok(result.errors.date);
});

test("check-in validation allows today", () => {
  const result = validateCheckinCreate({
    date: getServerDateString(),
    mood: "good",
    energy: "medium"
  });

  assert.deepEqual(result.errors, {});
});

test("check-in validation allows past dates and rejects future dates", () => {
  const pastDate = toDateOnly(getServerDateString());
  pastDate.setUTCDate(pastDate.getUTCDate() - 10);
  const futureDate = toDateOnly(getServerDateString());
  futureDate.setUTCDate(futureDate.getUTCDate() + 1);

  const pastResult = validateCheckinCreate({
    date: toDateString(pastDate),
    mood: "good",
    energy: "medium"
  });
  const futureResult = validateCheckinCreate({
    date: toDateString(futureDate),
    mood: "good",
    energy: "medium"
  });

  assert.deepEqual(pastResult.errors, {});
  assert.ok(futureResult.errors.date);
});

test("check-in validation normalizes old emoji mood labels", () => {
  const result = validateCheckinCreate({
    date: getServerDateString(),
    mood: "😄 Great",
    energy: "medium"
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.mood, "great");
});

test("check-in validation rejects unknown mood text", () => {
  const createResult = validateCheckinCreate({
    date: getServerDateString(),
    mood: "focused",
    energy: "medium"
  });
  const updateResult = validateCheckinUpdate({
    mood: "random"
  });

  assert.ok(createResult.errors.mood);
  assert.ok(updateResult.errors.mood);
});

test("UUID helper accepts valid ids and rejects malformed ids before Prisma queries", () => {
  assert.equal(isUuid("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isUuid("not-a-uuid"), false);
  assert.throws(() => assertUuid("not-a-uuid", "Habit id"), /Habit id must be a valid UUID/);
});
