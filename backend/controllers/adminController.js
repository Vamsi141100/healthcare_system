const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res, next) => {
  const { role, search } = req.query;
  let query = "SELECT id, name, email, role, created_at FROM users ";
  const queryParams = [];
  let conditions = [];

  if (role) {
    conditions.push(" role = ? ");
    queryParams.push(role);
  }
  if (search) {
    conditions.push(" (name LIKE ? OR email LIKE ?) ");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY created_at DESC ";

  try {
    const [users] = await pool.query(query, queryParams);
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users error:", error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const [
      rows,
    ] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get User By ID error:", error);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, role, password } = req.body;
  if (!name && !email && !role && !password) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  try {
    const [
      userCheck,
    ] = await pool.query("SELECT id, email FROM users WHERE id = ?", [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id === parseInt(userId, 10) && role && role !== "admin") {
      return res
        .status(400)
        .json({ message: "Admin cannot change their own role this way." });
    }

    const fieldsToUpdate = {};
    const queryParams = [];

    if (name) {
      fieldsToUpdate.name = name;
      queryParams.push(name);
    }
    if (role && ["patient", "doctor", "admin"].includes(role)) {
      fieldsToUpdate.role = role;
      queryParams.push(role);
    }
    if (email && email !== userCheck[0].email) {
      const [
        emailExists,
      ] = await pool.query("SELECT id FROM users WHERE email = ? AND id != ?", [
        email,
        userId,
      ]);
      if (emailExists.length > 0) {
        return res
          .status(400)
          .json({ message: "Email address is already in use." });
      }
      fieldsToUpdate.email = email;
      queryParams.push(email);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      fieldsToUpdate.password_hash = password_hash;
      queryParams.push(password_hash);
    }

    if (queryParams.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields to update provided." });
    }

    let query = "UPDATE users SET ";
    query += Object.keys(fieldsToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    query += " WHERE id = ?";
    queryParams.push(userId);

    await pool.query(query, queryParams);

    const [
      updatedUser,
    ] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser[0] });
  } catch (error) {
    console.error("Update User error:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  if (req.user.id === parseInt(userId, 10)) {
    return res
      .status(400)
      .json({ message: "Cannot delete your own admin account" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [
      userCheck,
    ] = await connection.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (userCheck.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "User not found" });
    }

    const [result] = await connection.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    await connection.commit();
    connection.release();

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({
          message:
            "User deleted successfully (associated records may be affected based on DB constraints)",
        });
    } else {
      return res
        .status(404)
        .json({ message: "User not found or delete failed" });
    }
  } catch (error) {
    console.error("Delete User error:", error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  const { status, patientId, doctorId } = req.query;
  let query = `
        SELECT
            a.*,
            p.name AS patient_name, p.id as patient_user_id,
            d_user.name AS doctor_name, doc.id AS doctor_profile_id, d_user.id as doctor_user_id,
            s.name AS service_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        LEFT JOIN doctors doc ON a.doctor_id = doc.id
        LEFT JOIN users d_user ON doc.user_id = d_user.id
         LEFT JOIN services s ON a.service_id = s.id
     `;
  const queryParams = [];
  const conditions = [];

  if (status) {
    conditions.push(" a.status = ? ");
    queryParams.push(status);
  }
  if (patientId) {
    conditions.push(" a.patient_id = ? ");
    queryParams.push(patientId);
  }
  if (doctorId) {
    conditions.push(" doc.id = ? ");
    queryParams.push(doctorId);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY a.scheduled_time DESC ";

  try {
    const [appointments] = await pool.query(query, queryParams);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Get All Appointments error:", error);
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  const appointmentId = req.params.id;

  try {
    const [
      appCheck,
    ] = await pool.query("SELECT id FROM appointments WHERE id = ?", [
      appointmentId,
    ]);
    if (appCheck.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const [result] = await pool.query("DELETE FROM appointments WHERE id = ?", [
      appointmentId,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Appointment deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ message: "Appointment not found or delete failed" });
    }
  } catch (error) {
    console.error("Delete Appointment (Admin) error:", error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllAppointments,
  deleteAppointment,
};