const pool = require("../config/db");

const getPublicStats = async (req, res, next) => {
  try {
    const [
      [[patientCount]],
      [[doctorCount]],
      [[appointmentsToday]],
      [[completedAppointments]],
      [[totalAppointmentsScheduled]],
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'patient'"),
      pool.query(
        "SELECT COUNT(*) as count FROM doctors WHERE approved_at IS NOT NULL"
      ),
      pool.query(
        "SELECT COUNT(*) as count FROM appointments WHERE DATE(scheduled_time) = CURDATE() AND status IN (?, ?)",
        ["pending", "confirmed"]
      ),
      pool.query(
        "SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'"
      ),
      pool.query("SELECT COUNT(*) as count FROM appointments"),
    ]);

    res.status(200).json({
      livePatients: patientCount.count,
      activeDoctors: doctorCount.count,
      appointmentsToday: appointmentsToday.count,
      treatmentsCompleted: completedAppointments.count,
      totalAppointments: totalAppointmentsScheduled.count,
    });
  } catch (error) {
    console.error("Get Public Stats error:", error);
    next(error);
  }
};

module.exports = {
  getPublicStats,
};