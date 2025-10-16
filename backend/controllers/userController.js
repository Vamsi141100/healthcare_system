const pool = require("../config/db");

const getMe = async (req, res, next) => {
  const { id, name, email, role } = req.user;
  try {
    let additionalDetails = {};
    if (role === "doctor") {
      const [
        doctorProfile,
      ] = await pool.query(
        "SELECT specialization, bio, qualifications FROM doctors WHERE user_id = ? AND approved_at IS NOT NULL",
        [id]
      );
      if (doctorProfile.length > 0) {
        additionalDetails = { ...doctorProfile[0] };
      }
    }

    res.status(200).json({
      id,
      name,
      email,
      role,
      ...additionalDetails,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    next(new Error("Failed to fetch user details"));
  }
};

module.exports = {
  getMe,
};