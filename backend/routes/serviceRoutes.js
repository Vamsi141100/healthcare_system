const express = require("express");
const router = express.Router();
const {
  getServices,
  getServiceById,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");

router.get("/list", protect, getServices);

router.get("/:id", protect, getServiceById);

module.exports = router;