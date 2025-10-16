const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [
        rows,
      ] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [decoded.id]
      );
      if (!rows || rows.length === 0) {
        throw new Error("User not found");
      }
      req.user = rows[0];
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Forbidden: Requires role(s) ${roles.join(", ")}` });
    }
    next();
  };
};

module.exports = { protect, checkRole };