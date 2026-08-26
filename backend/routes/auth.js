const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Email regex pattern for validation
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Input sanitization, validation, password hashing, JWT issuance)
 */
router.post('/register', async (req, res, next) => {
  try {
    let { name, age, email, password } = req.body;

    // 1. Input Sanitization & Injection Awareness
    // Ensure inputs are valid primitive types to prevent NoSQL object injection attacks (e.g. { email: { $gt: "" } })
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format. Name, email, and password must be strings.' });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    const parsedAge = parseInt(age, 10);

    // 2. Request Body Validation
    if (!name || name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: 'Name is required and must be between 2 and 50 characters.' });
    }

    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ error: 'Please enter a valid age between 1 and 120.' });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // 3. Password Hashing (Salt + Hash using bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new User({
      name,
      age: parsedAge,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // 4. JWT Issuance
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Return 201 Created with user info (excluding password) and JWT
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        age: savedUser.age,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, verify password, and return JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // 1. Input Sanitization & Injection Awareness
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be valid strings.' });
    }

    email = email.trim().toLowerCase();

    // 2. Request Body Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by sanitized email
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic 401 message to prevent user enumeration attacks
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Password Verification (bcrypt.compare)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. JWT Issuance
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile (JWT Verification)
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
