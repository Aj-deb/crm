const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const User = require("../models/User");

// ✅ Dashboard Summary Route
router.get("/", auth, async (req, res) => {
  try {
    // Count stats
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: "Converted" });
    const totalCustomers = await Customer.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });

    const conversionRate =
      totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : "0";

    // Get last 5 leads and customers
    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5);
    const recentCustomers = await Customer.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalLeads,
      convertedLeads,
      totalCustomers,
      activeUsers,
      conversionRate,
      recentLeads,
      recentCustomers,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

module.exports = router;
