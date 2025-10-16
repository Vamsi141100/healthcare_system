const express = require("express");
const router = express.Router();
const { orderLabTest } = require("../controllers/labController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/order", protect, checkRole(["patient"]), orderLabTest);

module.exports = router;