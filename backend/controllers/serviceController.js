const pool = require("../config/db");

const getServices = async (req, res, next) => {
  const { category } = req.query;

  try {
    let query = `
            SELECT id, name, description, base_fee, category
            FROM services
        `;
    const queryParams = [];

    if (category) {
      query += ` WHERE category = ? `;
      queryParams.push(category);
    }

    query += ` ORDER BY category, name ASC `;

    const [services] = await pool.query(query, queryParams);
    res.status(200).json(services);
  } catch (error) {
    console.error("Get Services error:", error);
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  const serviceId = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [
      serviceId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get Service By ID error:", error);
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
};