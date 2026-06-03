const ApiError = require("../utils/apiError");

function validateBody(validator) {
  return (req, res, next) => {
    const result = validator(req.body || {});

    if (Object.keys(result.errors).length > 0) {
      return next(new ApiError(400, "Validation failed.", result.errors));
    }

    req.body = result.value;
    return next();
  };
}

module.exports = {
  validateBody
};
