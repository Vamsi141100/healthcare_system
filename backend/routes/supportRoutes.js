const express = require("express");
const router = express.Router();
const {
  submitSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  getSupportTicketById,
  answerSupportTicket,
  updateTicketStatus,
} = require("../controllers/supportController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post(
  "/tickets",
  protect,
  checkRole(["patient", "doctor"]),
  submitSupportTicket
);

router.get(
  "/tickets/my",
  protect,
  checkRole(["patient", "doctor"]),
  getMySupportTickets
);

router.get("/tickets", protect, checkRole(["admin"]), getAllSupportTickets);
router.get("/tickets/:id", protect, checkRole(["admin"]), getSupportTicketById);
router.put(
  "/tickets/:id/answer",
  protect,
  checkRole(["admin"]),
  answerSupportTicket
);
router.put(
  "/tickets/:id/status",
  protect,
  checkRole(["admin"]),
  updateTicketStatus
);

module.exports = router;