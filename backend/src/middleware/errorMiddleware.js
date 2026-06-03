const config = require("../config/env");

function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = getStatusCode(error);

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, error.message);
  }

  const response = {
    message: getErrorMessage(error, statusCode),
    status: "error"
  };

  if (error.details) {
    response.details = error.details;
  }

  res.status(statusCode).json(response);
}

function getStatusCode(error) {
  if (error.statusCode) {
    return error.statusCode;
  }

  if (error.code === "P2002") {
    return 409;
  }

  if (error.code === "P2025") {
    return 404;
  }

  if (error.code === "P2003") {
    return 400;
  }

  if (error.name === "PrismaClientInitializationError") {
    return 503;
  }

  return 500;
}

function getErrorMessage(error, statusCode) {
  if (error.code === "P2002") {
    return "A record with this value already exists.";
  }

  if (error.code === "P2025") {
    return "Record not found.";
  }

  if (error.code === "P2003") {
    return "Related record does not exist.";
  }

  if (error.name === "PrismaClientInitializationError") {
    return "Database connection is unavailable.";
  }

  if (statusCode >= 500 && config.nodeEnv === "production") {
    return "Internal server error";
  }

  return error.message || "Internal server error";
}

module.exports = {
  notFoundHandler,
  errorHandler
};
