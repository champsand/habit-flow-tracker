const jwt = require("jsonwebtoken");
const config = require("../config/env");

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion || 0
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  createAuthToken,
  verifyAuthToken
};
