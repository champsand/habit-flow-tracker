const bcrypt = require("bcrypt");
const config = require("../config/env");

function hashPassword(password) {
  return bcrypt.hash(password, config.bcryptSaltRounds);
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  hashPassword,
  verifyPassword
};
