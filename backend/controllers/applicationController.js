const pool = require("../config/db");
const fs = require("fs");
const { sendEmail } = require('../utils/emailService');
const submitApplication = async (req, res, next) => {
  const { specialization, bio, applying_for_role = "doctor" } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Application documents are required" });
  }
  if (!specialization || !bio) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file on validation fail:", err);
    });
    return res
      .status(400)
      .json({ message: "Specialization and bio are required" });
  }

  const documentsPath = req.file.path
    .replace(/\\/g, "/")
    .substring(req.file.path.indexOf("/uploads/"));

  try {
    const [
      existing,
    ] = await pool.query(
      "SELECT id FROM applications WHERE user_id = ? AND status IN (?, ?)",
      [userId, "pending", "approved"]
    );
    if (existing.length > 0) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file for duplicate app:", err);
      });
      return res
        .status(400)
        .json({
          message: "You already have a pending or approved application",
        });
    }

    const [userCheck] = await pool.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    if (userCheck[0].role === "doctor") {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file for doctor role:", err);
      });
      return res
        .status(400)
        .json({ message: "You are already registered as a doctor" });
    }

    const [
      result,
    ] = await pool.query(
      "INSERT INTO applications (user_id, applying_for_role, specialization, bio, documents_path, status) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, applying_for_role, specialization, bio, documentsPath, "pending"]
    );

    const [
      newApplication,
    ] = await pool.query("SELECT * FROM applications WHERE id = ?", [
      result.insertId,
    ]);

    res
      .status(201)
      .json({
        message: "Application submitted successfully",
        application: newApplication[0],
      });
  } catch (error) {
    console.error("Submit Application error:", error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after DB error:", err);
      });
    }
    next(error);
  }
};

const getMyApplicationStatus = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const [
      applications,
    ] = await pool.query(
      "SELECT * FROM applications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1",
      [userId]
    );
    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No application found for this user" });
    }
    res.status(200).json(applications[0]);
  } catch (error) {
    console.error("Get My Application Status error:", error);
    next(error);
  }
};

const getAllApplications = async (req, res, next) => {
  const { status } = req.query;
  let query = `
         SELECT app.*, u.name as applicant_name, u.email as applicant_email
         FROM applications app
         JOIN users u ON app.user_id = u.id
    `;
  const queryParams = [];
  if (status) {
    query += " WHERE app.status = ? ";
    queryParams.push(status);
  }
  query += " ORDER BY app.submitted_at DESC ";

  try {
    const [applications] = await pool.query(query, queryParams);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Get All Applications error:", error);
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  const applicationId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT app.*, u.name as applicant_name, u.email as applicant_email
              FROM applications app
              JOIN users u ON app.user_id = u.id
              WHERE app.id = ?`,
      [applicationId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get Application By ID error:", error);
    next(error);
  }
};

const reviewApplication = async (req, res, next) => {
  const applicationId = req.params.id;
  const { status, admin_notes } = req.body;
  const adminId = req.user.id;
  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Invalid status. Must be "approved" or "rejected".' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [
      appRows,
    ] = await connection.query("SELECT * FROM applications WHERE id = ?", [
      applicationId,
    ]);
    if (appRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Application not found" });
    }
    const application = appRows[0];
    const [applicant] = await connection.query("SELECT name, email FROM users WHERE id = ?", [application.user_id]);

    if (application.status !== "pending") {
      await connection.rollback();
      connection.release();
      return res
        .status(400)
        .json({
          message: `Application status is already '${application.status}'. Cannot review again.`,
        });
    }

    const userId = application.user_id;
    const roleToAssign = application.applying_for_role;

    await connection.query(
      "UPDATE applications SET status = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?",
      [status, admin_notes || null, applicationId]
    );

    if (status === "approved") {
      if (roleToAssign === "doctor") {
        await connection.query("UPDATE users SET role = ? WHERE id = ?", [
          "doctor",
          userId,
        ]);

        await connection.query(
          "INSERT INTO doctors (user_id, specialization, bio, approved_at, qualifications) VALUES (?, ?, ?, NOW(), ?)",
          [
            userId,
            application.specialization,
            application.bio,
            `Docs: ${application.documents_path}`,
          ]
        );
      }
    }

    await connection.commit();
    connection.release();

    
    if (applicant.length > 0) {
        const user = applicant[0];
        sendEmail({
           to: user.email,
           subject: `Your Health Hub Application has been ${status}`,
           text: `Hi ${user.name},\n\nYour application to become a doctor on Health Hub has been ${status}.\n\nAdmin Notes: ${admin_notes || 'N/A'}\n\nThank you,\nThe Health Hub Team`,
           html: `<p>Hi ${user.name},</p><p>Your application to become a doctor on Health Hub has been <strong>${status}</strong>.</p><p><b>Admin Notes:</b> ${admin_notes || 'N/A'}</p><p>Thank you,<br>The Health Hub Team</p>`,
        });
    }

    const [
      updatedApp,
    ] = await pool.query("SELECT * FROM applications WHERE id = ?", [
      applicationId,
    ]);

    res
      .status(200)
      .json({
        message: `Application ${status} successfully.`,
        application: updatedApp[0],
      });
  } catch (error) {
    console.error("Review Application error:", error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplicationStatus,
  getAllApplications,
  getApplicationById,
  reviewApplication,
};