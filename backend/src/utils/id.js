const ApiError = require("./apiError");

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && uuidPattern.test(value);
}

function assertUuid(value, label = "Id") {
  if (!isUuid(value)) {
    throw new ApiError(400, `${label} must be a valid UUID.`);
  }
}

module.exports = {
  assertUuid,
  isUuid
};
