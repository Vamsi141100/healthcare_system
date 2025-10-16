const pool = require("../config/db");

const orderLabTest = async (req, res, next) => {
  const { service_id, order_details } = req.body;
  const patientId = req.user.id;

  if (!service_id) {
    return res
      .status(400)
      .json({ message: "Lab Test service selection is required." });
  }

  console.log(
    `PLACEHOLDER: Lab Test Order Received - Patient ID: ${patientId}, Service ID: ${service_id}, Details: ${order_details}`
  );

  try {
    const mockOrderId = Math.floor(Math.random() * 10000);
    await pool.query("SELECT 1");
    res.status(201).json({
      message: `Lab test order (ID: ${mockOrderId}) submitted successfully. You will be contacted for scheduling.`,
      order: {},
    });
  } catch (error) {
    console.error("Order Lab Test Placeholder Error:", error);
    next(error);
  }
};

module.exports = { orderLabTest };