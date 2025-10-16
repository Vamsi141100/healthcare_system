const express = require("express");
const router = express.Router();
const { submitClaim, getMyClaims, getAllClaims, updateClaimStatus } = require("../controllers/insuranceController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const { uploadClaimDocs } = require("../middleware/uploadMiddleware");

const claimUploads = uploadClaimDocs.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'insurance_card_front', maxCount: 1 },
    { name: 'government_id', maxCount: 1 }
]);

router.post(
  "/claims/:appointmentId",
  protect, checkRole(["patient"]), claimUploads,
  submitClaim
);

router.get("/claims/my", protect, checkRole(["patient"]), getMyClaims);

router.get("/claims", protect, checkRole(["admin"]), getAllClaims);
router.put("/claims/:id", protect, checkRole(["admin"]), updateClaimStatus);

module.exports = router;