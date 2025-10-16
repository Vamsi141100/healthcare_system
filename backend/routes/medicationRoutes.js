const express = require("express");
const router = express.Router();
const { requestMedication } = require("../controllers/medicationController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/request", protect, checkRole(["patient"]), requestMedication);

module.exports = router;