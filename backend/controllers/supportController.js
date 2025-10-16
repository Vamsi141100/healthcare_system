const pool = require("../config/db");

const submitSupportTicket = async (req, res, next) => {
  const { subject, question } = req.body;
  const userId = req.user.id;

  if (!subject || !question) {
    return res
      .status(400)
      .json({ message: "Subject and question are required" });
  }

  try {
    const [
      result,
    ] = await pool.query(
      "INSERT INTO support_tickets (user_id, subject, question, status) VALUES (?, ?, ?, ?)",
      [userId, subject, question, "open"]
    );
    const [
      newTicket,
    ] = await pool.query("SELECT * FROM support_tickets WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newTicket[0]);
  } catch (error) {
    console.error("Submit Support Ticket error:", error);
    next(error);
  }
};

const getMySupportTickets = async (req, res, next) => {
  const userId = req.user.id;
  const { status } = req.query;
  let query = "SELECT * FROM support_tickets WHERE user_id = ? ";
  const queryParams = [userId];

  if (status) {
    query += " AND status = ? ";
    queryParams.push(status);
  }
  query += " ORDER BY created_at DESC ";

  try {
    const [tickets] = await pool.query(query, queryParams);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Get My Support Tickets error:", error);
    next(error);
  }
};

const getAllSupportTickets = async (req, res, next) => {
  const { status } = req.query;
  let query = `
        SELECT st.*, u.name as user_name, u.email as user_email
        FROM support_tickets st
         JOIN users u ON st.user_id = u.id
    `;
  const queryParams = [];

  if (status) {
    query += " WHERE st.status = ? ";
    queryParams.push(status);
  }
  query += " ORDER BY st.created_at DESC ";

  try {
    const [tickets] = await pool.query(query, queryParams);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Get All Support Tickets error:", error);
    next(error);
  }
};

const getSupportTicketById = async (req, res, next) => {
  const ticketId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT st.*, u.name as user_name, u.email as user_email
             FROM support_tickets st
             JOIN users u ON st.user_id = u.id
             WHERE st.id = ?`,
      [ticketId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get Support Ticket By ID error:", error);
    next(error);
  }
};

const answerSupportTicket = async (req, res, next) => {
  const ticketId = req.params.id;
  const { answer } = req.body;
  const adminId = req.user.id;
  if (!answer) {
    return res.status(400).json({ message: "Answer content is required" });
  }

  try {
    const [
      result,
    ] = await pool.query(
      "UPDATE support_tickets SET answer = ?, status = ?, answered_at = NOW() WHERE id = ? AND status IN (?, ?)",
      [answer, "answered", ticketId, "open", "answered"]
    );

    if (result.affectedRows === 0) {
      const [
        ticketCheck,
      ] = await pool.query("SELECT status FROM support_tickets WHERE id = ?", [
        ticketId,
      ]);
      if (ticketCheck.length === 0) {
        return res.status(404).json({ message: "Support ticket not found" });
      } else {
        return res
          .status(400)
          .json({
            message: `Ticket is already '${ticketCheck[0].status}' or not found`,
          });
      }
    }

    const [
      updatedTicket,
    ] = await pool.query("SELECT * FROM support_tickets WHERE id = ?", [
      ticketId,
    ]);

    res.status(200).json(updatedTicket[0]);
  } catch (error) {
    console.error("Answer Support Ticket error:", error);
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  const ticketId = req.params.id;
  const { status } = req.body;
  if (!status || !["open", "answered", "closed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status provided" });
  }

  try {
    const [
      result,
    ] = await pool.query("UPDATE support_tickets SET status = ? WHERE id = ?", [
      status,
      ticketId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    const [
      updatedTicket,
    ] = await pool.query("SELECT * FROM support_tickets WHERE id = ?", [
      ticketId,
    ]);
    res.status(200).json(updatedTicket[0]);
  } catch (error) {
    console.error("Update Ticket Status error:", error);
    next(error);
  }
};

module.exports = {
  submitSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  getSupportTicketById,
  answerSupportTicket,
  updateTicketStatus,
};