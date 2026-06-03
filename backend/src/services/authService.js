const ApiError = require("../utils/apiError");
const { createUserRecord, toPublicUser } = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createAuthToken } = require("../utils/token");
const userRepository = require("./userRepository");

async function register({ name, email, password }) {
  const normalizedEmail = userRepository.normalizeEmail(email);
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create(
    createUserRecord({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    })
  );

  return {
    user: toPublicUser(user),
    token: createAuthToken(user)
  };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return {
    user: toPublicUser(user),
    token: createAuthToken(user)
  };
}

async function logout(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  await userRepository.update(userId, {
    tokenVersion: (user.tokenVersion || 0) + 1
  });
}

async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toPublicUser(user);
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
