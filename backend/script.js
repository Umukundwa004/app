const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/freshharvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  inStock: Boolean,
  stockQuantity: Number,
  imageUrl: String
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: String,
  customer: {
    name: String,
    phone: String,
    address: String
  },
  products: [{
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  deliveryFee: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'on-the-way', 'delivered'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Delivery Zone Schema
const deliveryZoneSchema = new mongoose.Schema({
  name: String,
  fee: Number,
  area: {
    type: { type: String, default: 'Polygon' },
    coordinates: [[[Number]]] // GeoJSON polygon coordinates
  }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: String,
  description: String
});

// Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
const Category = mongoose.model('Category', categorySchema);

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get out of stock products
app.get('/api/products/out-of-stock', async (req, res) => {
  try {
    const products = await Product.find({ inStock: false });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    order.orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const savedOrder = await order.save();
    
    // If payment is mobile money, simulate sending confirmation message
    if (order.paymentMethod === 'momo') {
      // In a real application, integrate with Mobile Money API
      console.log(`Sending Momo confirmation to ${order.customer.phone}`);
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: req.body },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get delivery fee by location
app.post('/api/delivery/fee', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // In a real application, you would check which delivery zone
    // the coordinates fall into and return the appropriate fee
    
    // This is a simplified version that just returns a fixed fee
    // based on distance from a central point
    const centralLat = -1.9706; // Kigali coordinates
    const centralLng = 30.1044;
    
    const distance = calculateDistance(latitude, longitude, centralLat, centralLng);
    
    let fee = 1000; // Default fee
    if (distance > 5) fee = 1500;
    if (distance > 10) fee = 2000;
    
    res.json({ fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Admin routes for product management
app.post('/api/admin/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/admin/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});