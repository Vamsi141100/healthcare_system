const express = require("express");
const router = express.Router();
const { getAllPharmacies } = require("../controllers/pharmacyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllPharmacies);

module.exports = router;