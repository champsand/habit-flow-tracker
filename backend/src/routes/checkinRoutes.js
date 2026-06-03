const express = require("express");
const checkinController = require("../controllers/checkinController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const { validateCheckinCreate, validateCheckinUpdate } = require("../schemas/checkinSchemas");

const router = express.Router();

router.use(requireAuth);

router.get("/", checkinController.listCheckins);
router.post("/", validateBody(validateCheckinCreate), checkinController.createCheckin);
router.get("/:date", checkinController.getCheckinByDate);
router.put("/:id", validateBody(validateCheckinUpdate), checkinController.updateCheckin);

module.exports = router;
