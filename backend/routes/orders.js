const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrder);
router.patch('/:id/status', auth, updateOrderStatus);
router.delete('/:id/cancel', auth, cancelOrder);

// Admin routes
router.get('/', auth, admin, getAllOrders);

module.exports = router;