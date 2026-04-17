/**
 * Request Validation Middleware
 * Uses express-validator to validate incoming requests
 */

const { body, validationResult } = require('express-validator');

// ── Validation Result Handler ─────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── Interview Validators ──────────────────────────────────────────
const validateInterviewSetup = [
  body('jobRole').trim().notEmpty().withMessage('Job role is required'),
  body('interviewType')
    .isIn(['hr', 'technical', 'behavioral'])
    .withMessage('Interview type must be hr, technical, or behavioral'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('questionCount')
    .optional()
    .isInt({ min: 3, max: 15 })
    .withMessage('Question count must be between 3 and 15'),
  handleValidation,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateInterviewSetup,
  handleValidation,
};
