const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const config = require("../config/env");

const defaultDevelopmentOrigins = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"];

function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    strictTransportSecurity: config.nodeEnv === "production" ? undefined : false
  });
}

function createRateLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        message
      });
    }
  });
}

const generalApiLimiter = createRateLimiter({
  windowMs: config.generalRateLimitWindowMs,
  limit: config.generalRateLimitMax,
  message: "Too many API requests. Please try again later."
});

const authLimiter = createRateLimiter({
  windowMs: config.authRateLimitWindowMs,
  limit: config.authRateLimitMax,
  message: "Too many authentication attempts. Please try again later."
});

const aiLimiter = createRateLimiter({
  windowMs: config.aiRateLimitWindowMs,
  limit: config.aiRateLimitMax,
  message: "Too many AI insight requests. Please try again later."
});

function getAllowedCorsOrigins() {
  if (config.corsAllowedOrigins.length > 0) {
    return config.corsAllowedOrigins;
  }

  return config.nodeEnv === "production" ? [] : defaultDevelopmentOrigins;
}

module.exports = {
  aiLimiter,
  authLimiter,
  generalApiLimiter,
  getAllowedCorsOrigins,
  securityHeaders
};
