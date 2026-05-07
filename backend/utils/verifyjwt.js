const jwt = require('jsonwebtoken');
const User = require("../models/User"); // Adjust path as needed
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Supports both formats: userId or id
    const userId = decoded.userId || decoded.id;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    // Added 'await' here because database calls are asynchronous
    const user = await User.findById(userId).select('primaryUniversityId role').lean();

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = {
      id:                  userId,
      _id:                 userId,
      role:                user.role,
      universityId:        user.primaryUniversityId,
      primaryUniversityId: user.primaryUniversityId,
      // Identity from JWT — no extra DB query needed
      email:               decoded.email     || null,
      name:                decoded.name      || null,
      firstName:           decoded.firstName || null,
      lastName:            decoded.lastName  || null,
    };
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token invalid', error: err.message });
  }
};

const verifyTokenOptional = async (req, res, next) => {
  // 1. Get token from header (or cookie)
  const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;

  // 2. If NO token, just proceed as a guest
  if (!token) {
    return next();
  }

  // 3. If token exists, try to verify it and fetch user details
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (userId) {
      // Fetch user details just like verifyToken to get Role and University ID
      const user = await User.findById(userId).select('primaryUniversityId role').lean();

      if (user) {
        req.user = {
          id: userId,
          _id: userId, // ✅ Support both formats
          role: user.role,
          universityId: user.primaryUniversityId,
          primaryUniversityId: user.primaryUniversityId, // ✅ Keep both for compatibility
          email: user.email // Optional: Capture email if available for guest applications
        };
      }
    }

    next();
  } catch (err) {
    // If token is invalid or DB fails, just log it and proceed as guest
    console.log("Invalid token in optional auth, treating as guest.", err.message);
    next();
  }
};

module.exports = { verifyToken, verifyTokenOptional };