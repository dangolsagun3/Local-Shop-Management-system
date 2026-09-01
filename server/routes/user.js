const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'localshop-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /signup (or /register)
 * Register new user, hash password via model pre-save hook, return JWT token for auto-login
 */
router.post(['/signup', '/register'], async (req, res) => {
  try {
    const { fullName, name, contact, phone, email, password, role, address } = req.body;
    const resolvedName = fullName || name;
    const resolvedContact = contact || phone;

    // Validate required fields
    if (!resolvedName || !resolvedContact || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, contact, email, and password are required',
        data: null
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        data: null
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedContact = resolvedContact.trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { contact: normalizedContact }]
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? 'email' : 'contact number';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
        data: null
      });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      fullName: resolvedName.trim(),
      contact: normalizedContact,
      email: normalizedEmail,
      password,
      role: role || 'customer',
      address: address ? address.trim() : undefined,
      status: 'active'
    });

    await user.save();

    // Generate JWT token (enables immediate auto-login on signup)
    const token = jwt.sign(
      {
        userId: user._id,
        sub: user._id,
        email: user.email,
        contact: user.contact,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      contact: user.contact,
      phone: user.contact,
      email: user.email,
      role: user.role,
      status: user.status,
      address: user.address
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      accessToken: token,
      user: userResponse,
      data: {
        token,
        accessToken: token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Server error during registration',
      data: null
    });
  }
});

/**
 * POST /login
 * Verify user credentials (email/contact + password) and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, contact, phone, password } = req.body;
    const identifier = (username || email || contact || phone || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Contact/Username and password are required',
        data: null
      });
    }

    // Find user by email or contact
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { contact: identifier },
        { fullName: new RegExp(`^${identifier}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        sub: user._id,
        email: user.email,
        contact: user.contact,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      contact: user.contact,
      phone: user.contact,
      email: user.email,
      role: user.role,
      status: user.status,
      address: user.address
    };

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      accessToken: token,
      user: userResponse,
      data: {
        token,
        accessToken: token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Server error during login',
      data: null
    });
  }
});

/**
 * GET /me (User profile)
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.sub).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    return res.json({
      success: true,
      message: 'User profile retrieved',
      user,
      data: user
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      data: null
    });
  }
});

module.exports = router;
