const express = require("express");
const authRoutes = require("./authRoutes");
const habitRoutes = require("./habitRoutes");
const habitLogRoutes = require("./habitLogRoutes");
const checkinRoutes = require("./checkinRoutes");
const weeklySummaryRoutes = require("./weeklySummaryRoutes");
const aiRoutes = require("./aiRoutes");
const config = require("../config/env");
const { sendSuccess } = require("../utils/httpResponse");

const router = express.Router();

router.get("/", (req, res) => {
  sendSuccess(res, 200, {
    message: "Habit Flow API",
    readiness: "ready",
    routes: {
      auth: `${config.apiPrefix}/auth`,
      habits: `${config.apiPrefix}/habits`,
      habitLogs: `${config.apiPrefix}/habit-logs`,
      checkins: `${config.apiPrefix}/checkins`,
      weeklySummary: `${config.apiPrefix}/weekly-summary`,
      ai: `${config.apiPrefix}/ai`,
      health: "/health"
    }
  });
});

router.use("/auth", authRoutes);
router.use("/habits", habitRoutes);
router.use("/habit-logs", habitLogRoutes);
router.use("/checkins", checkinRoutes);
router.use("/weekly-summary", weeklySummaryRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
