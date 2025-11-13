// controllers/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🧩 Generate JWT Token
const generateToken = (user) => {
  try {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (err) {
    console.error("❌ JWT generation failed:", err);
    return null;
  }
};

// ✅ REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hashing is handled in User model pre-save hook
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "sales",
    });

    const token = generateToken(user);
    if (!token) return res.status(500).json({ message: "Token generation failed" });

    res.status(201).json({
      message: "User registered successfully",
      token, // ✅ plain JWT string
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // 🚫 Block deactivated users
    if (user.status === "inactive") {
      return res.status(403).json({
        message:
          "Your account has been deactivated. Please contact the administrator.",
      });
    }

    // ✅ Compare password manually (for safety)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Update last login timestamp (optional)
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    if (!token) return res.status(500).json({ message: "Token generation failed" });

    res.status(200).json({
      message: "Login successful",
      token, // ✅ only the token string
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ PROFILE (authenticated)
exports.getProfile = async (req, res) => {
  try {
    // ✅ req.user.id is set by auth middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
