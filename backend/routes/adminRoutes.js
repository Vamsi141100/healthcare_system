const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllAppointments,
  deleteAppointment,
} = require("../controllers/adminController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const { createPharmacy, updatePharmacy, deletePharmacy } = require("../controllers/pharmacyController");

router.use(protect);
router.use(checkRole(["admin"]));

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/appointments", getAllAppointments);
router.delete("/appointments/:id", deleteAppointment);
router.post("/pharmacies", createPharmacy);
router.put("/pharmacies/:id", updatePharmacy);
router.delete("/pharmacies/:id", deletePharmacy);

module.exports = router;