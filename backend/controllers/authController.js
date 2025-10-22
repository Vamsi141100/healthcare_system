const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { sendEmail } = require('../utils/emailService'); 

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res, next) => {
  const { name, email, password, dob } = req.body;

  if (!name || !email || !password || !dob) {
    return res.status(400).json({ message: "Please provide name, email, password, and date of birth" });
  }

  try {
    const [
      existingUsers,
    ] = await pool.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [
      result,
    ] = await pool.query(
      "INSERT INTO users (name, email, password_hash, dob) VALUES (?, ?, ?, ?)",
      [name, email, password_hash, dob]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: "patient",
    };

    
    sendEmail({
        to: newUser.email,
        subject: 'Welcome to Health Hub!',
        text: `Hi ${newUser.name},\n\nWelcome to Health Hub! Your account has been created successfully. You can now log in and start managing your health.\n\nBest,\nThe Health Hub Team`,
        html: `<p>Hi ${newUser.name},</p><p>Welcome to <strong>Health Hub</strong>! Your account has been created successfully. You can now log in and start managing your health.</p><p>Best,<br>The Health Hub Team</p>`,
    });

    res.status(201).json({
      ...newUser,
      token: generateToken(newUser.id, newUser.role),
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const [
      users,
    ] = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};