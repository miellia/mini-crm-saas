const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper utility to sign a JWT token.
 * @param {string} id - The user's database ID.
 * @returns {string} The signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Authenticate a user and return a JWT token.
 * POST /api/auth/login
 * @param {import('express').Request} req - Express Request object containing email and password in body
 * @param {import('express').Response} res - Express Response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves the currently authenticated user's profile.
 * GET /api/auth/me
 * @param {import('express').Request} req - Express Request object containing authenticated user
 * @param {import('express').Response} res - Express Response object
 */
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
