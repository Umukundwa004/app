const Order = require('../models/Order');
const Product = require('../models/Product');
const DeliveryZone = require('../models/DeliveryZone');
const { notifyOrderStatusUpdate } = require('../utils/notifications');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, note } = req.body;
    
    // Calculate total amount and update product stock
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        });
      }
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // Calculate delivery fee based on location
    let deliveryFee = 0;
    if (deliveryAddress && deliveryAddress.location) {
      const zone = await DeliveryZone.findOne({
        polygon: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: deliveryAddress.location.coordinates
            }
          }
        }
      });
      
      if (zone) {
        deliveryFee = zone.fee;
      } else {
        // Default fee if no zone matched
        deliveryFee = 5.99;
      }
    }
    
    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryFee,
      deliveryAddress,
      paymentMethod,
      note,
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });
    
    await order.save();
    await order.populate('items.product', 'name images');
    await order.populate('user', 'name email phone');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('user', 'name email phone addresses');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only admin or the user who placed the order can update status
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    order.status = status;
    await order.save();
    
    // Notify user about status change
    if (req.user.role === 'admin') {
      await notifyOrderStatusUpdate(order, order.user);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', '_id')
      .populate('user', '_id');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be cancelled' 
      });
    }
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: item.quantity } }
      );
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { ...query, paymentStatus: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: { $add: ['$totalAmount', '$deliveryFee'] } } 
        } 
      }
    ]);
    
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};