// models/Customer.js
const mongoose = require("mongoose");

// ----------------------
// Notes Schema
// ----------------------
const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ----------------------
// Reminder Schema
// ----------------------
const ReminderSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    remindAt: { type: Date, required: true },
    reminded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ----------------------
// Customer Schema
// ----------------------
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: String,
    source: String,
    createdFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    convertedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // NEW FIELDS
    notes: [NoteSchema],          // ✔ For notes section
    reminders: [ReminderSchema],  // ✔ For reminder system
  },
  { timestamps: true }
);

// Prevent re-converting the same lead
customerSchema.index({ createdFrom: 1 }, { unique: true, sparse: true });

// Prevent duplicate emails (only when email exists)
customerSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

module.exports = mongoose.model("Customer", customerSchema);
