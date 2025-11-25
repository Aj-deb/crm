// controllers/customersController.js
const Customer = require('../models/Customer');

// Utilities
const toInt = (v, def) => {
  const n = parseInt(v);
  return Number.isNaN(n) ? def : n;
};

// GET /api/customers
// Supports: ?page=1&limit=10&search=foo&assigned=USERID|unassigned&status=StatusString
exports.getCustomers = async (req, res) => {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 10)));
    const q = (req.query.search || '').trim();
    const assigned = req.query.assigned || ''; // 'unassigned' or userId
    const status = req.query.status || '';

    const filter = {};

    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ name: re }, { email: re }, { phone: re }, { company: re }];
    }

    if (assigned) {
      if (assigned === 'unassigned') filter.assignedTo = null;
      else filter.assignedTo = assigned;
    }

    if (status) {
      filter.status = status;
    }

    const total = await Customer.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name role performanceRating')
      .populate('convertedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ customers, meta: { total, page, pages, limit } });
  } catch (err) {
    console.error('❌ getCustomers error:', err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, source, assignedTo } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // prevent duplicates by email
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

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const updates = req.body;
    // avoid accidental overwrites of notes/reminders via updateCustomer
    delete updates.notes;
    delete updates.reminders;

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

// DELETE /api/customers/:id
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

/* ---------- NOTES & REMINDERS ---------- */

// POST /api/customers/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Note text required' });

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const note = { text: text.trim(), author: req.user?.id || null };
    customer.notes.push(note);
    await customer.save();

    // return the newly added note (Mongoose will put timestamps)
    const last = customer.notes[customer.notes.length - 1];
    res.status(201).json({ message: 'Note added', note: last });
  } catch (err) {
    console.error('❌ addNote error:', err);
    res.status(500).json({ message: 'Failed to add note' });
  }
};

// POST /api/customers/:id/reminders
exports.addReminder = async (req, res) => {
  try {
    const { message, remindAt } = req.body;
    if (!message || !remindAt) return res.status(400).json({ message: 'message and remindAt required' });

    const dt = new Date(remindAt);
    if (Number.isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid remindAt' });

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const reminder = { message: message.trim(), remindAt: dt, reminded: false };
    customer.reminders.push(reminder);
    await customer.save();

    const last = customer.reminders[customer.reminders.length - 1];
    res.status(201).json({ message: 'Reminder added', reminder: last });
  } catch (err) {
    console.error('❌ addReminder error:', err);
    res.status(500).json({ message: 'Failed to add reminder' });
  }
};

// POST /api/customers/:id/reminders/:rid/done
exports.markReminderDone = async (req, res) => {
  try {
    const { id, rid } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const r = customer.reminders.id(rid);
    if (!r) return res.status(404).json({ message: 'Reminder not found' });

    r.reminded = true;
    await customer.save();
    res.json({ message: 'Reminder marked done' });
  } catch (err) {
    console.error('❌ markReminderDone error:', err);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
};
