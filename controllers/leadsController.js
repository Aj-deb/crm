const Lead = require('../models/Lead')
const User = require('../models/User')

// ✅ GET all leads (Admins get all, others see their assigned)
exports.getLeads = async (req, res) => {
  try {
    const role = req.user.role
    let leads

    if (role === 'admin' || role === 'manager') {
      leads = await Lead.find().populate('assignedTo', 'name role')
    } else {
      leads = await Lead.find({ assignedTo: req.user.id }).populate('assignedTo', 'name role')
    }

    res.json(leads)
  } catch (err) {
    console.error('❌ Fetch leads error:', err)
    res.status(500).json({ message: 'Failed to load leads' })
  }
}

// ✅ CREATE new lead (auto-assigns to best performer)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, status, priority, source } = req.body

    if (!name) return res.status(400).json({ message: 'Name is required' })

    // 🧠 Auto assign logic based on lowest activeLeads + high rating
    const assignedTo = await User.findOne({ role: { $in: ['sales', 'trainee'] } })
      .sort({ activeLeads: 1, rating: -1 })

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      priority,
      source,
      assignedTo: assignedTo?._id || null,
      createdBy: req.user.id
    })

    if (assignedTo) {
      assignedTo.activeLeads += 1
      await assignedTo.save()
    }

    res.status(201).json({ message: 'Lead created successfully', lead })
  } catch (err) {
    console.error('❌ Create lead error:', err)
    res.status(500).json({ message: 'Failed to create lead' })
  }
}

// ✅ UPDATE a lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    Object.assign(lead, req.body)
    await lead.save()

    res.json({ message: 'Lead updated successfully', lead })
  } catch (err) {
    console.error('❌ Update lead error:', err)
    res.status(500).json({ message: 'Failed to update lead' })
  }
}

// ✅ DELETE a lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    if (lead.assignedTo) {
      await User.findByIdAndUpdate(lead.assignedTo, { $inc: { activeLeads: -1 } })
    }

    res.json({ message: 'Lead deleted successfully' })
  } catch (err) {
    console.error('❌ Delete lead error:', err)
    res.status(500).json({ message: 'Failed to delete lead' })
  }
}
