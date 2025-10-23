const express = require("express");
const router = express.Router();
const {
  getDoctorDashboard,
  updateDoctorProfile,
  getApprovedDoctors,
  getPatientHistory,
} = require("../controllers/doctorController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, checkRole(["doctor"]), getDoctorDashboard);

router.put("/profile", protect, checkRole(["doctor"]), updateDoctorProfile);

router.get("/list", protect, getApprovedDoctors);

router.get("/patient-history/:patientId", protect, checkRole(["doctor", "admin"]), getPatientHistory);

module.exports = router;