const app = require("./app");
const config = require("./config/env");
const prisma = require("./config/prisma");
const { startSchedulers, stopSchedulers } = require("./jobs/scheduler");

const server = app.listen(config.port, () => {
  console.log(`Habit Flow API running on port ${config.port} (${config.nodeEnv})`);
  startSchedulers();
});

function shutdown(signal) {
  console.log(`${signal} received. Closing Habit Flow API server.`);
  stopSchedulers();
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Failed to disconnect Prisma cleanly:", error.message);
    }
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
