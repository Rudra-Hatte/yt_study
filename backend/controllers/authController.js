const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email is already registered'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: Object.values(error.errors)[0].message
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'Something went wrong during registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: user.enrolledCourses,
        preferences: user.preferences
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Something went wrong during login'
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Placeholder functions
const updateProfile = async (req, res) => {
  res.json({ message: 'Update profile - Coming soon' });
};

const changePassword = async (req, res) => {
  res.json({ message: 'Change password - Coming soon' });
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getMe: exports.getMe,
  updateProfile: exports.updateProfile,
  changePassword: exports.changePassword
};