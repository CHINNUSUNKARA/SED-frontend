const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Promisify jwt methods
const signToken = promisify(jwt.sign);
const verifyToken = promisify(jwt.verify);

// Token types
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification'
};

// Token expiration times (in seconds)
const TOKEN_EXPIRATION = {
  [TOKEN_TYPES.ACCESS]: 15 * 60,           // 15 minutes
  [TOKEN_TYPES.REFRESH]: 7 * 24 * 60 * 60, // 7 days
  [TOKEN_TYPES.RESET_PASSWORD]: 10 * 60,   // 10 minutes
  [TOKEN_TYPES.EMAIL_VERIFICATION]: 24 * 60 * 60 // 24 hours
};

// In-memory token blacklist (for production, use Redis or similar)
const tokenBlacklist = new Set();

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} type - Token type (access, refresh, etc.)
 * @param {object} additionalData - Additional data to include in the token
 * @returns {Promise<string>} - JWT token
 */
const generateToken = async (userId, type = TOKEN_TYPES.ACCESS, additionalData = {}) => {
  const payload = {
    sub: userId,
    type,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRATION[type] || TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS]),
    ...additionalData
  };

  return signToken(payload, process.env.JWT_SECRET);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Expected token type
 * @returns {Promise<object>} - Decoded token payload
 */
const verifyJwtToken = async (token, type = TOKEN_TYPES.ACCESS) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = await verifyToken(token, process.env.JWT_SECRET);
    
    // Verify token type
    if (decoded.type !== type) {
      throw new Error(`Invalid token type: expected ${type}, got ${decoded.type}`);
    }

    // Verify token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('Token has expired');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Generate access and refresh token pair
 * @param {string} userId - User ID
 * @returns {Promise<{accessToken: string, refreshToken: string}>} - Token pair
 */
const generateTokenPair = async (userId) => {
  const [accessToken, refreshToken] = await Promise.all([
    generateToken(userId, TOKEN_TYPES.ACCESS),
    generateToken(userId, TOKEN_TYPES.REFRESH)
  ]);

  return { accessToken, refreshToken };
};

/**
 * Blacklist a token
 * @param {string} token - Token to blacklist
 * @param {number} expiresIn - Time in seconds until the token expires (for auto-cleanup)
 */
const blacklistToken = (token, expiresIn = 86400) => {
  tokenBlacklist.add(token);
  
  // Auto-remove from blacklist after expiration
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresIn * 1000);
};

/**
 * Verify and get user from token
 * @param {string} token - JWT token
 * @param {string} type - Expected token type
 * @returns {Promise<object>} - User document
 */
const getUserFromToken = async (token, type = TOKEN_TYPES.ACCESS) => {
  try {
    const decoded = await verifyJwtToken(token, type);
    const user = await User.findById(decoded.sub).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Additional checks based on token type
    if (type === TOKEN_TYPES.REFRESH && user.refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to get user from token: ${error.message}`);
  }
};

/**
 * Generate a random token (for password reset, email verification, etc.)
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
const generateRandomToken = (length = 32) => {
  return require('crypto').randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

module.exports = {
  TOKEN_TYPES,
  generateToken,
  verifyJwtToken,
  generateTokenPair,
  blacklistToken,
  getUserFromToken,
  generateRandomToken
};
