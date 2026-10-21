
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const passport = require("../config/passport");
const { registerSchema } = require("../validations/authValidation");
const { ZodError } = require("zod");

// Register a new user
const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    const { name, email, password } = validation.data;

    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    console.error("Register Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Login an existing user
const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Passport Error:", err);
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Invalid email or password",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login Session Error:", err);
        return next(err);
      }
      req.session.save((err) => {
        if (err) {
          console.error("Session Save Error:", err);
          return next(err);
        }

        return res.status(200).json({
          message: "Logged in successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      });
    });
  })(req, res, next);
};

// Logout the current user
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({
        message: "Logged out successfully",
      });
    });
  });
};

// Get the currently authenticated user
const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  return res.status(200).json({
    user: req.user,
  });
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name FROM users"
    );

    return res.status(200).json(users.rows);
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  getAllUsers,
};
