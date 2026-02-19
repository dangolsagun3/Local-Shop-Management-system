const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'localshop-secret-key-2024';

// POST /api/auth/signup - Register a new user and auto-login
router.post('/signup', async (req, res) => {
  try {
    const { fullName, contact, email, password } = req.body;

    // Validate required fields
    if (!fullName || !contact || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { contact }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'contact';
      return res.status(400).json({ 
        success: false,
        message: `User with this ${field} already exists` 
      });
    }

    // Create new user
    const user = new User({
      fullName,
      contact,
      email,
      password
    });

    await user.save();

    // Generate JWT token (auto-login after signup)
    const token = jwt.sign(
      { userId: user._id, email: user.email, contact: user.contact },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        contact: user.contact,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Validate required fields
    if (!contact || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Contact and password are required' 
      });
    }

    // Find user by contact
    const user = await User.findOne({ contact });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, contact: user.contact },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        contact: user.contact,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

module.exports = router;
