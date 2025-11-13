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

router.get("/", auth, getLeads);
router.post("/", auth, createLead);
router.delete("/:id", auth, deleteLead);
router.patch("/:id/status", auth, updateLeadStatus);
router.post("/:id/convert", auth, convertLead);

module.exports = router;
