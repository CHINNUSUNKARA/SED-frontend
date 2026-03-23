const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, protectAdmin, authorizeRoles } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator, updatePasswordValidator, deleteUserValidator } = require('../middleware/validators');

const router = express.Router();

// ================= JWT SECRET =================
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET not defined");
    }
    return secret;
};

// ================= REGISTER =================
router.post('/register/student', registerValidator, async (req, res) => {
    const { name, email, password, acceptTerms } = req.body;

    try {
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // ✅ AUTO VERIFY
        user = new User({
            name,
            email,
            password,
            role: 'Student',
            acceptTerms,
            isVerified: true
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            getJwtSecret(),
            { expiresIn: '30d' }
        );

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// ================= LOGIN (ONLY ONE) =================
router.post('/login', loginValidator, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // ❌ NO EMAIL VERIFY CHECK

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            getJwtSecret(),
            { expiresIn: '30d' }
        );

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// ================= GOOGLE LOGIN =================
router.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body;

        const parts = idToken.split('.');
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        const { email, name, picture } = decoded;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                avatarUrl: picture,
                role: 'Student',
                isVerified: true,
                password: crypto.randomBytes(32).toString('hex')
            });
            await user.save();
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            getJwtSecret(),
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: 'Google login failed' });
    }
});

// ================= LOGOUT =================
router.post('/logout', (req, res) => {
    res.cookie('session_token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.json({ success: true, message: 'Logged out' });
});

// ================= GET USER =================
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
});

module.exports = router;