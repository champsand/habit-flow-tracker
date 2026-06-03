const express = require("express");
const habitController = require("../controllers/habitController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const { validateHabitCreate, validateHabitUpdate } = require("../schemas/habitSchemas");

const router = express.Router();

router.use(requireAuth);

router.get("/", habitController.listHabits);
router.post("/", validateBody(validateHabitCreate), habitController.createHabit);
router.get("/:id", habitController.getHabit);
router.put("/:id", validateBody(validateHabitUpdate), habitController.updateHabit);
router.delete("/:id", habitController.deleteHabit);

module.exports = router;
