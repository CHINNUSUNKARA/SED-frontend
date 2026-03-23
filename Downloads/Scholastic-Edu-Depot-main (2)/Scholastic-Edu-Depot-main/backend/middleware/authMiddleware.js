const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

// Middleware to protect routes - verifies JWT token
const protect = (req, res, next) => {
    try {
        // Log incoming request headers for debugging in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('[Auth] Request headers:', JSON.stringify(req.headers, null, 2));
            console.log('[Auth] Request cookies:', JSON.stringify(req.cookies, null, 2));
        }

        // Get token from cookies (for web) or Authorization header (for API calls)
        let token = req.cookies?.session_token ||
            req.cookies?.admin_session_token ||
            (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ?
                req.headers.authorization.split(' ')[1] : null);

        // For API requests, check for token in headers if not in cookies
        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        }

        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload
        req.user = decoded;

        // Log successful authentication
        console.log(`Authenticated user: ${decoded.email} (${decoded.role})`);

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please log in again.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized, authentication failed',
            code: 'AUTH_FAILED',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware to authorize roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

// Middleware to protect admin routes
const protectAdmin = (req, res, next) => {
    // First verify the token
    protect(req, res, () => {
        try {
            // Check if user has admin or marketing agent role (case-insensitive)
            const userRole = req.user?.role?.toLowerCase();
            const allowedRoles = ['admin', 'marketingagent'];

            if (req.user && allowedRoles.includes(userRole)) {
                console.log(`Admin access granted to: ${req.user.email} (${req.user.role})`);
                return next();
            }

            console.warn(`Unauthorized admin access attempt by user: ${req.user?.email || 'unknown'}`);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required',
                code: 'ADMIN_ACCESS_REQUIRED'
            });
        } catch (error) {
            console.error('Admin protection error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authorization',
                code: 'AUTH_ERROR',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
};

// For backward compatibility
const protectStudent = (req, res, next) => {
    protect(req, res, () => {
        if (req.user?.role?.toLowerCase() === 'student') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Student access required' });
        }
    });
};

const protectInstructor = (req, res, next) => {
    protect(req, res, () => {
        const userRole = req.user?.role?.toLowerCase();
        if (userRole === 'instructor' || userRole === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Instructor access required' });
        }
    });
};

// New authorize function for case-insensitive role checking
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Convert both user role and allowed roles to lowercase for case-insensitive comparison
        const userRole = req.user.role?.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
    authorizeRoles,
    protectAdmin,
    protectStudent,
    protectInstructor
};
