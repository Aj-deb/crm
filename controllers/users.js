// controllers/users.js
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

const allowedToCreate = {
  admin: ['manager', 'sales', 'support', 'viewer'],
  manager: ['sales', 'support', 'viewer'],
};

// -----------------------------
// 🔹 BASIC CRUD FUNCTIONS
// -----------------------------

// 📋 List users (admin sees all, manager sees only their team)
const listUsers = async (req, res) => {
  try {
    const role = req.user.role;
    let users;

    if (role === 'admin') {
      users = await User.find().select('-password');
    } else if (role === 'manager') {
      users = await User.find({ manager: req.user.id }).select('-password');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(users);
  } catch (err) {
    console.error('❌ Error listing users:', err);
    res.status(500).json({ message: 'Server error listing users' });
  }
};

// ➕ Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required' });

    if (!allowedToCreate[req.user.role]?.includes(role))
      return res.status(403).json({ message: 'Not allowed to create this role' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const payload = { name, email, password, role };
    if (req.user.role === 'manager') payload.manager = req.user.id;

    const user = await User.create(payload);
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

// ✏️ Update user
const updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role === 'manager' && String(user.manager) !== String(req.user.id))
      return res.status(403).json({ message: 'Managers can only edit their team' });

    if (role && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can change role' });

    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// ❌ Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} deleted successfully` });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// -----------------------------
// 💼 ENTERPRISE FEATURES
// -----------------------------

// 📊 1. List all users with performance stats
const listUsersWithStats = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const [leadAgg, custAgg] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: '$assignedTo',
            leadsAssigned: { $sum: 1 },
            leadsConverted: {
              $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] },
            },
          },
        },
      ]),
      Customer.aggregate([{ $group: { _id: '$createdBy', customersOwned: { $sum: 1 } } }]),
    ]);

    const leadMap = new Map(leadAgg.map((r) => [String(r._id), r]));
    const custMap = new Map(custAgg.map((r) => [String(r._id), r]));

    const data = users.map((u) => {
      const l = leadMap.get(String(u._id)) || {};
      const c = custMap.get(String(u._id)) || {};
      const leadsAssigned = l.leadsAssigned || 0;
      const leadsConverted = l.leadsConverted || 0;
      const customersOwned = c.customersOwned || 0;
      const conversion =
        leadsAssigned > 0 ? Number(((leadsConverted / leadsAssigned) * 100).toFixed(1)) : 0;

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || 'active',
        metrics: { leadsAssigned, leadsConverted, customersOwned, conversion },
        createdAt: u.createdAt,
      };
    });

    res.json(data);
  } catch (e) {
    console.error('❌ Error fetching stats:', e);
    res.status(500).json({ message: 'Failed to fetch users with stats' });
  }
};

// 👤 2. Get one user's profile + recent activity
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [leads, customers] = await Promise.all([
      Lead.find({ assignedTo: user._id }).sort({ updatedAt: -1 }).limit(10),
      Customer.find({ createdBy: user._id }).sort({ updatedAt: -1 }).limit(10),
    ]);

    res.json({ user, recent: { leads, customers } });
  } catch (e) {
    console.error('❌ Error fetching profile:', e);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// ⚙️ 3. Update user role/status/department (admin)
const updateUserRoleStatus = async (req, res) => {
  try {
    const { role, status, department } = req.body;
    const allowedRoles = ['admin', 'manager', 'sales', 'support', 'viewer'];
    const allowedStatus = ['active', 'inactive'];

    const payload = {};
    if (role) {
      if (!allowedRoles.includes(role))
        return res.status(400).json({ message: 'Invalid role' });
      payload.role = role;
    }
    if (status) {
      if (!allowedStatus.includes(status))
        return res.status(400).json({ message: 'Invalid status' });
      payload.status = status;
    }
    if (department) payload.department = department;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user: updated });
  } catch (e) {
    console.error('❌ Error updating user role/status:', e);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// 🚫 4. Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} deactivated successfully`, user });
  } catch (e) {
    console.error('❌ Error deactivating user:', e);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
};

// -----------------------------
// ✅ EXPORT EVERYTHING CLEANLY
// -----------------------------
module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listUsersWithStats,
  getUserProfile,
  updateUserRoleStatus,
  deactivateUser,
};
