// routes/customers.js
const express = require('express')
const router = express.Router()
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addNote,
  addReminder,
  markReminderDone
} = require('../controllers/customersController')
const auth = require('../middleware/auth')

router.get('/', auth, getCustomers)               // supports pagination, search, filter
router.post('/', auth, createCustomer)
router.put('/:id', auth, updateCustomer)
router.delete('/:id', auth, deleteCustomer)

// notes & reminders
router.post('/:id/notes', auth, addNote)
router.post('/:id/reminders', auth, addReminder)
router.post('/:id/reminders/:rid/done', auth, markReminderDone)

module.exports = router
