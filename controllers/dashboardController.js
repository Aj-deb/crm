// controllers/dashboardController.js
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total leads
    const totalLeads = await Lead.countDocuments();

    // Leads that are still active/open
    const activeLeads = await Lead.countDocuments({ status: 'active' });

    // Leads converted into customers
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    // Total customers (including manual or direct customers)
    const totalCustomers = await Customer.countDocuments();

    // ✅ Correct conversion rate calculation
    const conversionRate =
      totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      totalLeads,
      activeLeads,
      totalCustomers,
      conversionRate: Number(conversionRate),
    });
  } catch (err) {
    console.error('❌ Error loading dashboard stats:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};
