const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  
  generateAndAddPrescription,
  downloadAppointmentInvoice,
  markAppointmentAsPaid,
} = require("../controllers/appointmentController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const { uploadPrescription } = require("../middleware/uploadMiddleware");

router.post("/", protect, checkRole(["patient"]), createAppointment);

router.get("/my", protect, checkRole(["patient", "doctor"]), getMyAppointments);

router.get(
  "/:id",
  protect,
  checkRole(["patient", "doctor", "admin"]),
  getAppointmentById
);

router.put("/:id", protect, checkRole(["doctor", "admin"]), updateAppointment);

router.put("/:id/pay", protect, checkRole(["patient"]), markAppointmentAsPaid);

router.post(
  "/:id/prescription",
  protect,
  checkRole(["doctor"]),
  generateAndAddPrescription
);

router.get(
  "/:id/invoice",
  protect,
  checkRole(["patient", "admin"]),
  downloadAppointmentInvoice
);

module.exports = router;