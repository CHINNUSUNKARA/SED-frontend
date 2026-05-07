const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, protectAdmin, authorizeRoles } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator, updatePasswordValidator, deleteUserValidator } = require('../middleware/validators');
const sendEmail = require('../utils/sendEmail');
const { getVerificationEmailTemplate } = require('../utils/emailTemplates');
const {verifyToken} = require('../utils/verifyjwt');
const router = express.Router();

// CSRF token endpoint
router.get('/csrf-token', (req, res) => {
    try {
        console.log('CSRF token endpoint hit in auth routes');
        // Generate CSRF token if the middleware provides it, otherwise fall back
        const csrfToken = (typeof req.csrfToken === 'function') ? req.csrfToken() : (res.locals.csrfToken || '');

        if (csrfToken) {
            // Set a non-httpOnly cookie so the frontend can read the token if needed
            res.cookie('XSRF-TOKEN', csrfToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                httpOnly: false
            });
        }

        res.json({
            success: true,
            message: 'CSRF token generated successfully',
            csrfToken
        });
    } catch (error) {
        console.error('Error in CSRF token endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating CSRF token',
            error: error.message
        });
    }
});

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
    }
    return secret;
};

const sendVerificationEmail = async (user, req) => {
    // Only generate a new token if one doesn't exist or is expired.
    let verificationToken = null;
    const tokenMissingOrExpired = !user.emailVerificationToken || !user.emailVerificationExpire || user.emailVerificationExpire < Date.now();
    if (tokenMissingOrExpired) {
        verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
    } else {
        // The stored token is hashed; we need to derive the raw token to send in email.
        // Since we don't store the raw token, regenerate a fresh one for the email and store it.
        verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
    }

    // Build a backend URL so clicks from email hit the server directly.
    // This makes verification reliable when users click from mail clients.
    const backendBaseUrl = `${req.protocol}://${req.get('host')}`;
    const frontendBaseUrl = req.headers.origin || 'http://localhost:3000';
    const verificationUrl = `${backendBaseUrl}/api/auth/verify-email/${verificationToken}`;

    const html = getVerificationEmailTemplate(user.name, verificationUrl);
    const message = `Hi ${user.name},\n\nPlease verify your email address by clicking the link below:\n${verificationUrl}\n\nThis link will expire in 15 minutes.`;

    try {
        const result = await sendEmail({
            email: user.email,
            subject: 'Verify Your Email Address',
            message
        });
        if (!result || result.ok === false) {
            console.warn('Verification email not sent:', result && result.reason ? result.reason : 'unknown');
        }
    } catch (emailErr) {
        console.error('Error while attempting to send verification email:', emailErr);
        // Do not throw — registration should succeed even if email cannot be sent
    }
};

// POST /api/auth/register/student
router.post('/register/student', registerValidator, async (req, res) => {
    const { name, email, password, acceptTerms } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with Student role
        user = new User({
            name,
            email,
            password,
            role: 'Student', // Ensure role is set to Student
            acceptTerms,
            isVerified: false // Email verification will be required
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Generate email verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(user, req);

        // Create token (user won't be fully logged in until email is verified)
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            getJwtSecret(),
            { expiresIn: '1d' } // Shorter expiry for unverified accounts
        );

        // Set cookie
        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            token,
            role: user.role,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
    try {
        const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: verificationToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        const frontendBaseUrl = req.headers.origin || 'http://localhost:3000';

        if (!user) {
            // Redirect to frontend with an error status so users see a friendly message
            const redirectOnInvalid = `${frontendBaseUrl}/verify-email/${req.params.token}?status=error&message=${encodeURIComponent('Invalid or expired verification token.')}`;
            return res.redirect(302, redirectOnInvalid);
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        // If this endpoint is hit directly by a browser (from the email link),
        // redirect to the frontend verification page with a success status so
        // the user sees a friendly confirmation page.
        const redirectUrl = `${frontendBaseUrl}/verify-email/${req.params.token}?status=success`;
        return res.redirect(302, redirectUrl);

    } catch (error) {
        // On error, redirect back to the frontend with an error status so the
        // frontend can show a friendly message.
        const redirectOnError = `${req.headers.origin || 'http://localhost:3000'}/verify-email/${req.params.token}?status=error&message=${encodeURIComponent(error.message)}`;
        return res.redirect(302, redirectOnError);
    }
});


// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'This account is already verified.' });
        }

        await sendVerificationEmail(user, req);

        res.status(200).json({ message: 'Verification email sent successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('api hitted')
    try {
        console.log(`Login attempt for email: ${email}`);

        // Find user by email (case-insensitive)
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });

        if (!user) {
            console.log(`No user found with email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        console.log(`User found: ${user.email}, Role: ${user.role}, Verified: ${user.isVerified}`);

        // Check if user is verified (only for Students)
        if (user.role === 'Student' && !user.isVerified) {
            console.log(`Unverified student account: ${user.email}`);
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in.',
                needsVerification: true
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Create token with user data
        const tokenPayload = {
            userId: user._id.toString(), // Ensure ID is string to prevent ObjectId issues
            email: user.email,
            role: user.role,
            name: user.name
        };

        console.log('Creating JWT token with payload:', tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            getJwtSecret(),
            { expiresIn: '30d' }
        );

        // Set HTTP-only cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
        };

        console.log('Setting session cookie with options:', cookieOptions);
        res.cookie('session_token', token, cookieOptions);

        // Return user data (without password)
        const { password: _, ...userData } = user.toObject();

        console.log(`Login successful for user: ${user.email}, role: ${user.role}`);

        // Determine redirect path based on role
        let redirectTo = '/dashboard';
        if (user.role === 'Admin') {
            redirectTo = '/admin/dashboard';
        } else if (user.role === 'MarketingAgent') {
            redirectTo = '/marketing/dashboard';
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            role: user.role,
            user: userData,
            redirectTo: redirectTo
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find admin/agent user by email (case-insensitive) and role
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            role: { $in: ['Admin', 'MarketingAgent'] } // Only allow admin and marketing agent roles
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Create token with user data
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            getJwtSecret(),
            { expiresIn: '8h' } // Shorter session for admin
        );

        // Set HTTP-only cookie with proper CORS settings
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'localhost'
        };

        // In development, we need to set secure to false for localhost
        if (process.env.NODE_ENV !== 'production') {
            cookieOptions.secure = false;
            cookieOptions.sameSite = 'lax';
            delete cookieOptions.domain; // Don't set domain in development
        }

        res.cookie('admin_session_token', token, cookieOptions);

        // Return user data (without password)
        const { password: _, ...userData } = user.toObject();

        // Determine redirect path based on role
        let redirectTo = '/admin/dashboard';
        if (user.role === 'MarketingAgent') {
            redirectTo = '/marketing/dashboard';
        }

        res.status(200).json({
            success: true,
            message: user.role === 'Admin' ? 'Admin login successful' : 'Agent login successful',
            token,
            role: user.role,
            user: userData,
            redirectTo: redirectTo
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login. Please try again.'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // Cookie options for clearing cookies
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    };

    // Clear both session tokens
    res.cookie('session_token', '', cookieOptions);
    res.cookie('admin_session_token', '', cookieOptions);

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// GET /api/auth/me - Get current user's profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        console.log(`Fetching profile for user ID: ${req.user.id}`);
        const user = await User.findById(req.user.id).select('-password -__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                avatarUrl: user.avatarUrl,
                enrolledCourses: user.enrolledCourses,
                savedCourses: user.savedCourses,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user profile'
        });
    }
});

// Get current student profile
router.get('/me/student', protect, authorizeRoles('Student'), (req, res) => {
    // Remove sensitive data before sending the user data
    const user = req.user.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    res.json({ user });
});

// Get current admin/agent profile
router.get('/me/admin', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -__v -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            console.warn(`Admin/Agent not found for ID: ${req.user.userId}`);
            return res.status(404).json({
                success: false,
                message: 'Admin/Agent not found',
                code: 'ADMIN_NOT_FOUND'
            });
        }

        // Verify the user has the correct role
        if (!['Admin', 'MarketingAgent'].includes(user.role)) {
            console.warn(`Unauthorized role access: ${user.role} for user: ${user.email}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin/Agent privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            });
        }

        // Prepare user data for response
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            permissions: user.permissions || []
        };

        // Update last login time
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            user: userData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get admin profile error:', error);

        // Handle specific errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format',
                code: 'INVALID_ID_FORMAT'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching admin profile',
            code: 'SERVER_ERROR',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get current marketing agent profile
router.get('/me/marketingagent', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -__v -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            console.warn(`Marketing agent not found for ID: ${req.user.userId}`);
            return res.status(404).json({
                success: false,
                message: 'Marketing agent not found',
                code: 'MARKETING_AGENT_NOT_FOUND'
            });
        }

        // Verify the user has the MarketingAgent role
        if (user.role !== 'MarketingAgent') {
            console.warn(`Unauthorized role access: ${user.role} for user: ${user.email}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Marketing Agent privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            });
        }

        // Prepare user data for response
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            permissions: user.permissions || []
        };

        // Update last login time
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            user: userData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get marketing agent profile error:', error);

        // Handle specific errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format',
                code: 'INVALID_ID_FORMAT'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching marketing agent profile',
            code: 'SERVER_ERROR',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Temporary route to create an admin user (for testing only)
router.post('/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new admin user
        user = new User({
            name,
            email,
            password,
            role: 'Admin',
            isVerified: true // Skip email verification for testing
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return user data (without password)
        const { password: _, ...userData } = user.toObject();

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: userData
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin user',
            error: error.message
        });
    }
});

// Temporary route to list admin users (for debugging only)
router.get('/admin-users', async (req, res) => {
    try {
        const adminUsers = await User.find({ role: { $in: ['Admin', 'MarketingAgent'] } }).select('-password');
        res.status(200).json({
            success: true,
            count: adminUsers.length,
            users: adminUsers
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin users',
            error: error.message
        });
    }
});

// POST /api/auth/update-password (Authenticated)
router.post('/update-password', protect, authorizeRoles('Student'), updatePasswordValidator, async (req, res) => {
    const { email } = req.user;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Your current password is not correct.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/forgot-password (Public)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user) {
            // We return 200 even if user doesn't exist to prevent email enumeration
            return res.status(200).json({ message: 'Email sent' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset url
        const frontendBaseUrl = req.headers.origin || 'http://localhost:5173';
        const resetUrl = `${frontendBaseUrl}/#/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit the following link to reset your password: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ message: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/reset-password/:resetToken (Public)
router.post('/reset-password/:resetToken', async (req, res) => {
    const { password } = req.body;

    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        // Set new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', protect, authorizeRoles('Student'), deleteUserValidator, async (req, res) => {
    const { password } = req.body;
    const { email } = req.user;

    try {
        // Find the user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Delete the user
        await User.findByIdAndDelete(user._id);

        // Clear the session cookie
        res.cookie('student_session_token', '', {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: 'Your account has been successfully deleted.'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: 'Error deleting account',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Temporary route to list admin users (for debugging only)
router.get('/list-admins', async (req, res) => {
    try {
        const admins = await User.find({
            role: { $in: ['Admin', 'MarketingAgent'] }
        }).select('-password -__v');

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        console.error('Error listing admins:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving admin users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Check if admin user exists
router.get('/check-admin', async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'Admin' });
        res.status(200).json({
            success: true,
            exists: !!admin,
            admin: admin ? { email: admin.email, name: admin.name } : null
        });
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking admin user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Google OAuth Login Endpoint
router.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID Token is required'
            });
        }

        // In production, verify the token with Google's servers using google-auth-library
        // For now, we'll decode it (note: this is not secure and should use proper JWT verification)
        const parts = idToken.split('.');
        if (parts.length !== 3) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        // Decode the payload (second part)
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const { email, name, picture } = decoded;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email not found in token'
            });
        }

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from Google info
            user = new User({
                email,
                name: name || email.split('@')[0],
                avatarUrl: picture || null,
                role: 'Student',
                isVerified: true, // Google accounts are verified
                password: crypto.randomBytes(32).toString('hex'), // Random password
                oauthProvider: 'google',
                oauthId: decoded.sub
            });
            await user.save();
        } else {
            // Update OAuth info if user already exists
            if (!user.oauthProvider) {
                user.oauthProvider = 'google';
                user.oauthId = decoded.sub;
                await user.save();
            }
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        // Set session cookie
        res.cookie('session_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            message: 'Google login successful',
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isEmailVerified: user.isVerified,
                avatar: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Google login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;