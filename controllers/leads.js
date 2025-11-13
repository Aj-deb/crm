const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const User = require("../models/User"); // ✅ Added to find top users dynamically

// 🟢 Get All Leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedTo", "name role performanceRating")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error("❌ getLeads:", err);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

// 🟢 Create Lead with Smart AI Assignment
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, assignedTo } = req.body;
    if (!name) return res.status(400).json({ message: "Lead name required" });

    // 🎯 Auto-priority & rating rules
    const rules = {
      Website: { priority: "High", rating: "Hot", score: 90 },
      Referral: { priority: "High", rating: "Hot", score: 85 },
      "Social Media": { priority: "Medium", rating: "Warm", score: 70 },
      "Email Campaign": { priority: "Low", rating: "Cold", score: 50 },
      Advertisement: { priority: "Low", rating: "Cold", score: 40 },
      Manual: { priority: "Medium", rating: "Warm", score: 60 },
    };

    const rule = rules[source] || rules.Manual;
    const { priority, rating, score } = rule;

    // 🧠 Intelligent Auto-Assignment Logic
    let assignedUser = assignedTo || null;

    if (!assignedUser) {
      // Build query based on lead priority
      let query = { role: "sales", status: "active" };

      if (priority === "High") query.performanceRating = { $gte: 4.5 };
      else if (priority === "Medium") query.performanceRating = { $gte: 3.5 };
      else query.performanceRating = { $gte: 2.0 };

      // Find best available user based on rating + lowest lead count
      const bestUser = await User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "leads",
            localField: "_id",
            foreignField: "assignedTo",
            as: "leadCount",
          },
        },
        {
          $addFields: { totalLeads: { $size: "$leadCount" } },
        },
        { $sort: { performanceRating: -1, totalLeads: 1 } },
        { $limit: 1 },
      ]);

      if (bestUser.length > 0) {
        assignedUser = bestUser[0]._id;
        console.log(
          `✅ [Auto Assigned] ${priority}-priority lead → ${bestUser[0].name} (${bestUser[0].performanceRating}⭐)`
        );
      }
    }

    // ✅ Create Lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source: source || "Manual",
      priority,
      rating,
      score,
      assignedTo: assignedUser,
      createdBy: req.user?.id || null,
    });

    // Return populated lead
    const populatedLead = await Lead.findById(lead._id).populate(
      "assignedTo",
      "name role performanceRating"
    );

    res.status(201).json({
      message: "Lead created successfully (AI auto-assigned)",
      lead: populatedLead,
    });
  } catch (err) {
    console.error("❌ createLead error:", err);
    res.status(500).json({ message: "Failed to create lead" });
  }
};

// 🟢 Delete Lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("❌ deleteLead:", err);
    res.status(500).json({ message: "Failed to delete lead" });
  }
};

// 🟢 Update Lead Status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("assignedTo", "name role performanceRating");

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Status updated successfully", lead });
  } catch (err) {
    console.error("❌ updateLeadStatus:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// 🟢 Convert Lead → Customer
// controllers/leads.js
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // If we already converted this lead or a customer with same email exists, return that
    const existing = await Customer.findOne({
      $or: [
        { createdFrom: lead._id },
        ...(lead.email ? [{ email: lead.email.toLowerCase() }] : []),
      ],
    })
      .populate("assignedTo", "name role")
      .populate("convertedBy", "name role");

    if (existing) {
      // ensure lead status is consistent
      if (lead.status !== "Converted") {
        lead.status = "Converted";
        await lead.save();
      }
      return res.status(200).json({
        message: "Lead already converted (returning existing customer)",
        customer: existing,
      });
    }

    // fresh conversion
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email?.toLowerCase() || undefined,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      createdFrom: lead._id,
      assignedTo: lead.assignedTo || null,
      convertedBy: req.user?.id || null,
    });

    lead.status = "Converted";
    await lead.save();

    res.json({ message: "Lead converted to customer", customer });
  } catch (err) {
    console.error("❌ convertLead:", err);
    // Handle duplicate key nicely
    if (err.code === 11000) {
      return res
        .status(200)
        .json({ message: "Customer already exists (unique index hit)" });
    }
    res.status(500).json({ message: "Conversion failed" });
  }
};
