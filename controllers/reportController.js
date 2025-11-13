const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const User = require("../models/User");

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate, source, assignedTo, priority } = req.query;
    const filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 🎯 Optional filters
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name role")
      .sort({ createdAt: -1 });

    const customers = await Customer.find(filter)
      .populate("assignedTo", "name role")
      .sort({ createdAt: -1 });

    const totalLeads = leads.length;
    const totalCustomers = customers.length;
    const conversionRate =
      totalLeads > 0 ? ((totalCustomers / totalLeads) * 100).toFixed(2) : 0;

    res.json({ totalLeads, totalCustomers, conversionRate, leads, customers });
  } catch (err) {
    console.error("❌ getReports:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
