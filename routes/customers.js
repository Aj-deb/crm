const express = require('express')
const router = express.Router()
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customersController')
const auth = require('../middleware/auth')

router.get('/', auth, getCustomers)
router.post('/', auth, createCustomer)
router.put('/:id', auth, updateCustomer)
router.delete('/:id', auth, deleteCustomer)

module.exports = router
