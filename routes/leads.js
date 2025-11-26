const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getLeads,
  createLead,
  deleteLead,
  updateLeadStatus,
  convertLead,
} = require("../controllers/leads");

const Lead = require("../models/Lead");

// ========= Normal CRM Routes (unchanged) =========
router.get("/", auth, getLeads);

router.post("/", auth, async (req, res) => {
  try {
    const lead = await createLead(req, res, true);

    // 🔥 Broadcast to all clients
    global.io.emit("lead_added", lead);

  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id", auth, deleteLead);
router.patch("/:id/status", auth, updateLeadStatus);
router.post("/:id/convert", auth, convertLead);

// ========= WEBHOOK ROUTE (ANY WEBSITE CAN SEND LEADS) =========
// No auth → external site can send leads directly
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const lead = await Lead.create({
      name: data.name || "Unknown",
      email: data.email || "",
      phone: data.phone || "",
      company: data.company || "",
      source: data.source || "Website",
      message: data.message || "",
      status: "New",
    });

    // 🔥 Send live update to all dashboards
    global.io.emit("lead_added", lead);

    res.status(200).json({ success: true, received: true, lead });
  } catch (err) {
    console.log("Webhook Error:", err);
    res.status(500).json({ success: false, received: false });
  }
});

module.exports = router;
