const pool = require("../config/db");

const requestMedication = async (req, res, next) => {
  const { service_id, medication_details, notes } = req.body;
  const patientId = req.user.id;

  if (!medication_details && !service_id) {
    return res
      .status(400)
      .json({
        message: "Medication details or specific request type are required.",
      });
  }

  console.log(
    `PLACEHOLDER: Medication Request - Patient ID: ${patientId}, Service ID: ${service_id}, Details: ${medication_details}, Notes: ${notes}`
  );

  try {
    const mockRequestId = Math.floor(Math.random() * 10000);
    await pool.query("SELECT 1");

    res.status(201).json({
      message: `Medication request (ID: ${mockRequestId}) submitted successfully. A doctor will review it.`,
      request: {},
    });
  } catch (error) {
    console.error("Request Medication Placeholder Error:", error);
    next(error);
  }
};

module.exports = { requestMedication };