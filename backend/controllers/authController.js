const bcrypt = require("bcrypt");
const pool = require("../config/db");
const passport = require("../config/passport");
const { registerSchema } = require('../validations/authValidation');
const { ZodError } = require('zod');

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [validatedData.email],
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [validatedData.name, validatedData.email, hashedPassword],
    );
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ error: info.message || "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res
        .status(200)
        .json({
          message: "Logged in successfully",
          user: { id: user.id, name: user.name, email: user.email },
        });
    });
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Error logging out" });
    res.status(200).json({ message: "Logged out successfully" });
  });
};
const getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, logout, getMe };
