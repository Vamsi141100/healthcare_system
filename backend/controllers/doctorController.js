const pool = require("../config/db");

const getDoctorDashboard = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [
      doctorRows,
    ] = await pool.query(
      "SELECT id, specialization, bio, approved_at FROM doctors WHERE user_id = ?",
      [userId]
    );
    if (doctorRows.length === 0) {
      return res
        .status(403)
        .json({ message: "Doctor profile not found or not approved" });
    }
    const doctor = doctorRows[0];
    const doctorId = doctor.id;
    const [
      [upcomingCount],
    ] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND scheduled_time >= NOW() AND status IN (?, ?)",
      [doctorId, "pending", "confirmed"]
    );
    const [
      [pendingCount],
    ] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = ?",
      [doctorId, "pending"]
    );

    res.status(200).json({
      message: "Doctor dashboard data",
      profile: doctor,
      stats: {
        upcomingAppointments: upcomingCount.count,
        pendingAppointments: pendingCount.count,
      },
    });
  } catch (error) {
    console.error("Get Doctor Dashboard error:", error);
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  const { bio, specialization } = req.body;
  const userId = req.user.id;

  if (bio === undefined && specialization === undefined) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  try {
    const fieldsToUpdate = {};
    const queryParams = [];
    if (bio !== undefined) {
      fieldsToUpdate.bio = bio;
      queryParams.push(bio);
    }
    if (specialization !== undefined) {
      fieldsToUpdate.specialization = specialization;
      queryParams.push(specialization);
    }

    if (queryParams.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    let query = "UPDATE doctors SET ";
    query += Object.keys(fieldsToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    query += " WHERE user_id = ?";
    queryParams.push(userId);

    const [result] = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Doctor profile not found or no changes made." });
    }

    const [
      updatedProfile,
    ] = await pool.query(
      "SELECT d.id, d.user_id, d.specialization, d.bio, d.qualifications, d.approved_at, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.user_id = ?",
      [userId]
    );

    res
      .status(200)
      .json({
        message: "Profile updated successfully",
        profile: updatedProfile[0],
      });
  } catch (error) {
    console.error("Update Doctor Profile error:", error);
    next(error);
  }
};

const getApprovedDoctors = async (req, res, next) => {
  const { specialization } = req.query;
  try {
    let query = `
            SELECT
                doc.id,
                usr.name,
                doc.specialization
            FROM doctors doc
            JOIN users usr ON doc.user_id = usr.id
            WHERE doc.approved_at IS NOT NULL
        `;
    const queryParams = [];

    if (specialization) {
      query += ` AND doc.specialization LIKE ? `;
      queryParams.push(`%${specialization}%`);
    }

    query += ` ORDER BY usr.name ASC `;

    const [doctors] = await pool.query(query, queryParams);

    const [specializationsResult] = await pool.query(`
            SELECT DISTINCT specialization FROM doctors WHERE approved_at IS NOT NULL AND specialization IS NOT NULL ORDER BY specialization ASC
        `);
    const distinctSpecializations = specializationsResult.map(
      (s) => s.specialization
    );

    res.status(200).json({
      doctors: doctors,
      specializations: distinctSpecializations,
    });
  } catch (error) {
    console.error("Get Approved Doctors error:", error);
    next(error);
  }
};

module.exports = {
  getDoctorDashboard,
  updateDoctorProfile,
  getApprovedDoctors,
};