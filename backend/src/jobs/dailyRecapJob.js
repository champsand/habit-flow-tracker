const prisma = require("../config/prisma");
const { getServerDateString, toDateOnly } = require("../utils/date");

async function runDailyRecapJob() {
  const today = getServerDateString();
  const reminderCandidates = await getDailyRecapCandidates(today);
  const reminderCandidateCount = reminderCandidates.length;

  console.log(`[daily-recap] ${today}: ${reminderCandidateCount} user(s) missing today's check-in.`);

  return {
    date: today,
    reminderCandidateCount
  };
}

async function getDailyRecapCandidates(dateString = getServerDateString()) {
  const date = toDateOnly(dateString);

  return prisma.user.findMany({
    where: {
      dailyCheckins: {
        none: {
          date
        }
      }
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });
}

module.exports = {
  getDailyRecapCandidates,
  runDailyRecapJob
};
