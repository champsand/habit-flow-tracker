const config = require("../config/env");
const { getAllowedCorsOrigins } = require("./securityMiddleware");

const allowedMethods = "GET,POST,PUT,DELETE,OPTIONS";
const allowedHeaders = "Content-Type,Authorization";

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedCorsOrigins();
  const allowAllOrigins = allowedOrigins.includes("*");
  const isAllowedOrigin = origin && (allowAllOrigins || allowedOrigins.includes(origin));

  if (config.nodeEnv === "production" && config.corsAllowCredentials && allowAllOrigins) {
    return next(new Error("CORS wildcard origins cannot be used with credentials in production."));
  }

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);

    if (config.corsAllowCredentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

module.exports = corsMiddleware;
