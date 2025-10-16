const express = require("express");
const router = express.Router();
const {
  getDoctorDashboard,
  updateDoctorProfile,
  getApprovedDoctors,
} = require("../controllers/doctorController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, checkRole(["doctor"]), getDoctorDashboard);

router.put("/profile", protect, checkRole(["doctor"]), updateDoctorProfile);

router.get("/list", protect, getApprovedDoctors);

module.exports = router;