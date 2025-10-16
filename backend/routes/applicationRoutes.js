const express = require("express");
const router = express.Router();
const {
  submitApplication,
  getMyApplicationStatus,
  getAllApplications,
  getApplicationById,
  reviewApplication,
} = require("../controllers/applicationController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const { uploadApplicationDoc } = require("../middleware/uploadMiddleware");

router.post(
  "/apply",
  protect,
  checkRole(["patient"]),
  uploadApplicationDoc.single("document"),
  submitApplication
);
router.get(
  "/my",
  protect,
  checkRole(["patient", "doctor"]),
  getMyApplicationStatus
);
router.get("/", protect, checkRole(["admin"]), getAllApplications);
router.get("/:id", protect, checkRole(["admin"]), getApplicationById);
router.put("/:id/review", protect, checkRole(["admin"]), reviewApplication);

module.exports = router;