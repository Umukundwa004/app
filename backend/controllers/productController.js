const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const { category, featured, search, minPrice, maxPrice, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ 
        $or: [
          { name: new RegExp(category, 'i') },
          { _id: category }
        ]
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Filter by search term
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;
    
    const imageUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      alt: name
    }));
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      featured: featured === 'true',
      images: imageUrls
    });
    
    await product.save();
    await product.populate('category', 'name');
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      featured: featured === 'true'
    };
    
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: name
      }));
      updateData.images = imageUrls;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (admin only - soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = new Category({
      name,
      description,
      image: req.file ? {
        url: `/uploads/${req.file.filename}`,
        alt: name
      } : null
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const updateData = { name, description };
    
    if (req.file) {
      updateData.image = {
        url: `/uploads/${req.file.filename}`,
        alt: name
      };
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category (admin only - soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Also deactivate all products in this category
    await Product.updateMany(
      { category: req.params.id },
      { isActive: false }
    );
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};