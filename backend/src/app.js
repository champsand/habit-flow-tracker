const express = require("express");
const config = require("./config/env");
const healthRoutes = require("./routes/healthRoutes");
const apiRoutes = require("./routes");
const corsMiddleware = require("./middleware/corsMiddleware");
const { generalApiLimiter, securityHeaders } = require("./middleware/securityMiddleware");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");
if (config.trustProxy) {
  app.set("trust proxy", 1);
}
app.use(securityHeaders());
app.use(corsMiddleware);
app.use(express.json({ limit: config.jsonBodyLimit }));

app.use("/health", healthRoutes);
app.use(config.apiPrefix, generalApiLimiter, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
