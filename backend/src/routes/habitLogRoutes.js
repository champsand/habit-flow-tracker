const express = require("express");
const habitLogController = require("../controllers/habitLogController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const {
  validateAvoidanceCreate,
  validateHabitLogCreate,
  validateHabitLogUpdate
} = require("../schemas/habitLogSchemas");

const router = express.Router();

router.use(requireAuth);

router.get("/", habitLogController.listHabitLogs);
router.post("/", validateBody(validateHabitLogCreate), habitLogController.createHabitLog);
router.post("/avoid", validateBody(validateAvoidanceCreate), habitLogController.createAvoidanceLog);
router.get("/:id", habitLogController.getHabitLog);
router.put("/:id", validateBody(validateHabitLogUpdate), habitLogController.updateHabitLog);
router.delete("/:id", habitLogController.deleteHabitLog);

module.exports = router;
