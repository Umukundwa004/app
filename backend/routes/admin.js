const express = require('express');
const {
  getDashboardStats,
  getSalesReport,
  getLowStockAlerts,
  createDeliveryZone,
  getDeliveryZones,
  updateDeliveryZone,
  deleteDeliveryZone,
  getUsers,
  updateUser
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/dashboard', auth, admin, getDashboardStats);
router.get('/sales-report', auth, admin, getSalesReport);
router.get('/low-stock', auth, admin, getLowStockAlerts);
router.get('/users', auth, admin, getUsers);
router.put('/users/:id', auth, admin, updateUser);
router.post('/delivery-zones', auth, admin, createDeliveryZone);
router.get('/delivery-zones', auth, admin, getDeliveryZones);
router.put('/delivery-zones/:id', auth, admin, updateDeliveryZone);
router.delete('/delivery-zones/:id', auth, admin, deleteDeliveryZone);

module.exports = router;