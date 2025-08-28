const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const DeliveryZone = require('../models/DeliveryZone');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Today's orders
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: { $add: ['$totalAmount', '$deliveryFee'] } } } }
    ]);
    
    // Recent orders (last 7 days)
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Total products and categories
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    
    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Sales data for chart (last 7 days)
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: { $add: ['$totalAmount', '$deliveryFee'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Popular products
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);
    
    res.json({
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      totalProducts,
      totalCategories,
      totalCustomers,
      salesData,
      popularProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let matchStage = {};
    let groupStage = {};
    let sortStage = { _id: 1 };
    
    // Date filter
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    // Only completed orders
    matchStage.paymentStatus = 'completed';
    
    // Group by time period
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    } else if (groupBy === 'year') {
      dateFormat = '%Y';
    }
    
    groupStage = {
      _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
      totalSales: { $sum: { $add: ['$totalAmount', '$deliveryFee'] } },
      totalOrders: { $sum: 1 },
      averageOrderValue: { $avg: { $add: ['$totalAmount', '$deliveryFee'] } }
    };
    
    const report = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: sortStage }
    ]);
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockProducts = await Product.find({
      stock: { $lte: parseInt(threshold) },
      isActive: true
    }).select('name stock price');
    
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage delivery zones
exports.createDeliveryZone = async (req, res) => {
  try {
    const { name, district, fee, coordinates } = req.body;
    
    const zone = new DeliveryZone({
      name,
      district,
      fee: parseFloat(fee),
      polygon: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    });
    
    await zone.save();
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeliveryZones = async (req, res) => {
  try {
    const zones = await DeliveryZone.find();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDeliveryZone = async (req, res) => {
  try {
    const { name, district, fee, coordinates } = req.body;
    
    const zone = await DeliveryZone.findByIdAndUpdate(
      req.params.id,
      {
        name,
        district,
        fee: parseFloat(fee),
        polygon: coordinates ? {
          type: 'Polygon',
          coordinates: [coordinates]
        } : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }
    
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDeliveryZone = async (req, res) => {
  try {
    const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }
    
    res.json({ message: 'Delivery zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};