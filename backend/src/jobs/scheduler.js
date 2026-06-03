const cron = require("node-cron");
const config = require("../config/env");
const { runDailyRecapJob } = require("./dailyRecapJob");

const scheduledTasks = [];

function startSchedulers() {
  if (scheduledTasks.length > 0) {
    return scheduledTasks;
  }

  if (!config.schedulerEnabled) {
    console.log("Habit Flow scheduler disabled.");
    return scheduledTasks;
  }

  if (!cron.validate(config.dailyRecapCron)) {
    console.warn(`Habit Flow scheduler skipped. Invalid DAILY_RECAP_CRON: ${config.dailyRecapCron}`);
    return scheduledTasks;
  }

  scheduledTasks.push(
    cron.schedule(config.dailyRecapCron, async () => {
      try {
        await runDailyRecapJob();
      } catch (error) {
        console.error("[daily-recap] job failed:", error.message);
      }
    })
  );

  console.log(`Habit Flow scheduler started. Daily recap cron: ${config.dailyRecapCron}`);
  return scheduledTasks;
}

function stopSchedulers() {
  for (const task of scheduledTasks) {
    task.stop();
    if (typeof task.destroy === "function") {
      task.destroy();
    }
  }

  scheduledTasks.length = 0;
}

module.exports = {
  startSchedulers,
  stopSchedulers
};
