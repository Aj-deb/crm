// models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },          // may be absent; we handle that in index
    phone: { type: String },
    company: String,
    source: String,
    createdFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    convertedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ✅ Prevent re-converting the same lead
customerSchema.index({ createdFrom: 1 }, { unique: true, sparse: true });

// ✅ Prevent duplicate emails (only when email exists)
customerSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);


module.exports = mongoose.model("Customer", customerSchema);
