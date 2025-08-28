const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/notifications');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password, phone });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to FreshProduce!',
      `Hi ${name},\n\nWelcome to FreshProduce! Your account has been successfully created.\n\nHappy shopping!`
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add address
exports.addAddress = async (req, res) => {
  try {
    const { name, address, city, district, isDefault, lat, lng } = req.body;
    
    const newAddress = {
      name,
      address,
      city,
      district,
      isDefault,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
      }
    };

    const user = await User.findById(req.user.id);

    // If setting as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { name, address, city, district, isDefault, lat, lng } = req.body;
    const addressId = req.params.addressId;

    const user = await User.findById(req.user.id);
    const addressToUpdate = user.addresses.id(addressId);

    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Address not found' });
    }

    addressToUpdate.name = name || addressToUpdate.name;
    addressToUpdate.address = address || addressToUpdate.address;
    addressToUpdate.city = city || addressToUpdate.city;
    addressToUpdate.district = district || addressToUpdate.district;
    
    if (lat && lng) {
      addressToUpdate.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }

    // If setting as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    } else {
      addressToUpdate.isDefault = isDefault;
    }

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const user = await User.findById(req.user.id);
    user.addresses.pull(addressId);
    await user.save();

    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token (in a real app, you'd use a more secure method)
    const resetToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET + user.password, 
      { expiresIn: '1h' }
    );

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
    );

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.password = newPassword;
    await user.save();

    // Send confirmation email
    await sendEmail(
      user.email,
      'Password Reset Successful',
      'Your password has been successfully reset. If you did not request this change, please contact support immediately.'
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};