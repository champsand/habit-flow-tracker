const ApiError = require("../utils/apiError");
const { verifyAuthToken } = require("../utils/token");
const { toPublicUser } = require("../models/userModel");
const userRepository = require("../services/userRepository");

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new ApiError(401, "Authentication required.");
    }

    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.sub);

    if (!user || (user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
      throw new ApiError(401, "Invalid or expired token.");
    }

    req.auth = {
      userId: user.id
    };
    req.user = toPublicUser(user);
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(401, "Invalid or expired token."));
  }
}

module.exports = {
  requireAuth
};
