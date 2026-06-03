const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/securityMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const { validateRegister, validateLogin } = require("../schemas/authSchemas");

const router = express.Router();

router.post("/register", authLimiter, validateBody(validateRegister), authController.register);
router.post("/login", authLimiter, validateBody(validateLogin), authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
