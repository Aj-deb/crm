const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// ✅ GET all users (Admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password");

    // 🧩 Compute CRM metrics (leads, conversions, customers)
    const leads = await Lead.find({}).select("assignedTo status");
    const customers = await Customer.find({}).select("createdFrom");

    const userStats = users.map((u) => {
      const userLeads = leads.filter(
        (l) => l.assignedTo && l.assignedTo.toString() === u._id.toString()
      );
      const converted = userLeads.filter((l) => l.status === "Converted");
      const ownedCustomers = customers.filter(
        (c) => c.createdFrom && userLeads.find((l) => l._id.equals(c.createdFrom))
      );

      const totalLeads = userLeads.length;
      const totalConverted = converted.length;
      const conversionRate =
        totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(2) : "0.00";

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLogin: u.updatedAt,
        metrics: {
          leadsAssigned: totalLeads,
          leadsConverted: totalConverted,
          conversion: conversionRate,
          customersOwned: ownedCustomers.length,
        },
      };
    });

    res.json(userStats);
  } catch (err) {
    console.error("❌ Failed to load users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ /users/me error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Get single user profile (with recent activity)
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const recentLeads = await Lead.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status");

    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name");

    res.json({
      recent: { leads: recentLeads, customers: recentCustomers },
    });
  } catch (err) {
    console.error("❌ Failed to fetch user details:", err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// ✅ Create new user (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      role,
      status: "active",
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id, name, email, role },
    });
  } catch (err) {
    console.error("❌ Failed to create user:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
});

// ✅ Update user role or status
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update user:", err);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// ✅ Deactivate user
router.put("/:id/deactivate", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `${user.name} deactivated successfully` });
  } catch (err) {
    console.error("❌ Failed to deactivate user:", err);
    res.status(500).json({ message: "Failed to deactivate user" });
  }
});

module.exports = router;
