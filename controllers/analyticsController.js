const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const User = require("../models/User");

exports.getAnalytics = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: "Converted" });
    const pendingLeads = totalLeads - convertedLeads;
    const totalCustomers = await Customer.countDocuments();

    const conversionRate =
      totalLeads > 0
        ? ((convertedLeads / totalLeads) * 100).toFixed(2)
        : 0;

    const sourceStats = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const priorityStats = await Lead.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const userPerformance = await User.aggregate([
      { $match: { role: "sales", status: "active" } },
      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "assignedTo",
          as: "leads",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "assignedTo",
          as: "customers",
        },
      },
      {
        $addFields: {
          totalLeads: { $size: "$leads" },
          totalCustomers: { $size: "$customers" },
          conversionRate: {
            $cond: [
              { $gt: [{ $size: "$leads" }, 0] },
              {
                $multiply: [
                  { $divide: [{ $size: "$customers" }, { $size: "$leads" }] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
            name: 1,
            role: 1,
            performanceRating: { $ifNull: ["$performanceRating", 0] }, // ✅ default 0
            totalLeads: 1,
            totalCustomers: 1,
            conversionRate: { $round: ["$conversionRate", 2] },
        },
      },
      { $sort: { conversionRate: -1 } },
    ]);

    res.json({
      totalLeads,
      convertedLeads,
      pendingLeads,
      totalCustomers,
      conversionRate,
      sourceStats,
      priorityStats,
      userPerformance,
    });
  } catch (err) {
    console.error("❌ getAnalytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
