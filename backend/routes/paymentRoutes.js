const express = require("express");
const router = express.Router();
const { createCheckoutSession, stripeWebhook } = require("../controllers/paymentController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

router.post(
  "/create-checkout-session/:appointmentId",
  protect,
  checkRole(["patient"]),
  createCheckoutSession
);

module.exports = router;