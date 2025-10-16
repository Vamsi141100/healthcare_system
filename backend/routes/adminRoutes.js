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

router.use(protect);
router.use(checkRole(["admin"]));

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/appointments", getAllAppointments);
router.delete("/appointments/:id", deleteAppointment);

module.exports = router;