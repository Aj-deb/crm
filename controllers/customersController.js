// controllers/customersController.js
const Customer = require('../models/Customer');

// 🟢 Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('assignedTo', 'name role performanceRating')
      .populate('convertedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error('❌ getCustomers error:', err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, source, assignedTo } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // ✅ prevent duplicates by email (or phone as fallback)
    if (email) {
      const exists = await Customer.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Customer with this email already exists" });
    }

    const customer = await Customer.create({
      name,
      email: email?.toLowerCase() || undefined,
      phone,
      company,
      source: source || "Manual",
      assignedTo: assignedTo || null,
      convertedBy: req.user?.id || null,
    });

    res.status(201).json({ message: "Customer added successfully", customer });
  } catch (err) {
    console.error("❌ createCustomer error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate customer (unique index)" });
    }
    res.status(500).json({ message: "Failed to create customer" });
  }
};

// 🟢 Update customer info
exports.updateCustomer = async (req, res) => {
  try {
    const updates = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate('assignedTo', 'name role');

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully', customer });
  } catch (err) {
    console.error('❌ updateCustomer error:', err);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

// 🟢 Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: `${customer.name} deleted successfully` });
  } catch (err) {
    console.error('❌ deleteCustomer error:', err);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
};
