const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    source: {
      type: String,
      enum: [
        "Manual",
        "Website",
        "Social Media",
        "Email Campaign",
        "Referral",
        "Advertisement",
      ],
      default: "Manual",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    rating: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "Warm",
    },
    score: { type: Number, default: 0 },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
