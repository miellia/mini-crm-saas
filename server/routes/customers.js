const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateStatus,
  addInteraction,
  getInteractions,
  getStats,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Dashboard stats
router.get('/stats', getStats);

// Customer CRUD
router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

// Pipeline status
router.put('/:id/status', updateStatus);

// Interactions
router.route('/:id/interactions').get(getInteractions).post(addInteraction);

module.exports = router;
