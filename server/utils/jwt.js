/**
 * JWT Utility
 * Helper functions for token generation
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { generateToken };
