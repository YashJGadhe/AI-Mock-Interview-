/**
 * Authentication Controller
 * Handles user signup, login, and profile endpoints
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// ── Signup ────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create new user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        targetRole: user.targetRole,
        experience: user.experience,
        skills: user.skills,
        stats: user.stats,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Profile ───────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// ── Update Profile ────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'bio', 'jobTitle', 'targetRole',
      'experience', 'skills', 'linkedIn', 'github', 'avatar',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getProfile, updateProfile };
