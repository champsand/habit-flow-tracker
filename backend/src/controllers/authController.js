const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const { sendSuccess } = require("../utils/httpResponse");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  sendSuccess(res, 201, {
    message: "Registration successful.",
    ...result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  sendSuccess(res, 200, {
    message: "Login successful.",
    ...result
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth.userId);

  sendSuccess(res, 200, {
    message: "Logout successful."
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth.userId);

  sendSuccess(res, 200, {
    user
  });
});

module.exports = {
  register,
  login,
  logout,
  me
};
