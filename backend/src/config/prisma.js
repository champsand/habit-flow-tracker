const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const config = require("./env");

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: config.databaseUrl
    }),
    log: config.nodeEnv === "development" ? ["warn", "error"] : ["error"]
  });
}

const prisma = globalThis.__habitFlowPrisma || createPrismaClient();

if (config.nodeEnv !== "production") {
  globalThis.__habitFlowPrisma = prisma;
}

module.exports = prisma;
