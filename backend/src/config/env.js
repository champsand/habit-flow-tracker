const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

function parseList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function parseMilliseconds(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeApiPrefix(value) {
  const rawPrefix = (value || "/api").trim();
  const withLeadingSlash = rawPrefix.startsWith("/") ? rawPrefix : `/${rawPrefix}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
}

function readRequiredSecret(name, fallback) {
  const value = process.env[name] || fallback;

  if (process.env.NODE_ENV === "production" && value === fallback) {
    throw new Error(`${name} must be configured in production.`);
  }

  return value;
}

function readDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL must be configured.");
  }

  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInteger(process.env.PORT, 5000),
  apiPrefix: normalizeApiPrefix(process.env.API_PREFIX),
  databaseUrl: readDatabaseUrl(),
  jwtSecret: readRequiredSecret("JWT_SECRET", "change-this-secret-in-development"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bcryptSaltRounds: parseInteger(process.env.BCRYPT_SALT_ROUNDS, 10),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "100kb",
  trustProxy: parseBoolean(process.env.TRUST_PROXY),
  corsAllowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS),
  corsAllowCredentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS),
  generalRateLimitWindowMs: parseMilliseconds(process.env.GENERAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  generalRateLimitMax: parseInteger(process.env.GENERAL_RATE_LIMIT_MAX, 300),
  authRateLimitWindowMs: parseMilliseconds(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  authRateLimitMax: parseInteger(process.env.AUTH_RATE_LIMIT_MAX, 20),
  aiRateLimitWindowMs: parseMilliseconds(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  aiRateLimitMax: parseInteger(process.env.AI_RATE_LIMIT_MAX, 30),
  schedulerEnabled: process.env.SCHEDULER_ENABLED !== "false",
  dailyRecapCron: process.env.DAILY_RECAP_CRON || "0 21 * * *",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  geminiTemperature: parseNumber(process.env.GEMINI_TEMPERATURE, 0.3),
  geminiMaxOutputTokens: parseInteger(process.env.GEMINI_MAX_OUTPUT_TOKENS, 220)
};

if (config.nodeEnv === "production" && config.corsAllowCredentials && config.corsAllowedOrigins.includes("*")) {
  throw new Error("CORS_ALLOWED_ORIGINS cannot include * when CORS_ALLOW_CREDENTIALS=true in production.");
}

module.exports = config;
