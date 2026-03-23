const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');
const { protectStudent, protectAdmin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Import Razorpay only if needed to prevent initialization errors
let Razorpay;
let razorpay = null;

// Only initialize Razorpay if the required environment variables are set
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined. Payment processing will not work.');
}

// Middleware to check if Razorpay is configured
const checkRazorpayConfig = (req, res, next) => {
    if (!razorpay) {
        return res.status(503).json({
            success: false,
            message: 'Payment processing is currently unavailable. Please try again later.'
        });
    }
    next();
};

// @desc    Step 1: Initiate Razorpay Order
// @route   POST /api/orders/create-order
// @access  Private/Student
router.post('/create-order', protectStudent, checkRazorpayConfig, async (req, res) => {
    const { courseSlug, amount } = req.body;

    try {
        const course = await Course.findOne({ slug: courseSlug });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment processing is currently unavailable. Please try again later.'
            });
        }

        // Razorpay expects amount in paisa (smallest currency unit)
        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID // Send public key to frontend
        });

    } catch (error) {
        console.error("Razorpay Order Creation Failed:", error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to initiate payment gateway', 
            error: error.message 
        });
    }
});

// @desc    Step 2: Verify Payment & Save to DB
// @route   POST /api/orders/verify-payment
// @access  Private/Student
router.post('/verify-payment', protectStudent, checkRazorpayConfig, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({
            success: false,
            message: 'Payment processing is currently unavailable. Please try again later.'
        });
    }
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        courseSlug, 
        amount 
    } = req.body;

    try {
        // 1. Cryptographic Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ message: 'Payment verification failed. Signatures do not match.' });
        }

        // 2. Fetch Data
        const user = await User.findOne({ email: req.user.email });
        const course = await Course.findOne({ slug: courseSlug });

        if (!user || !course) {
            return res.status(404).json({ message: 'User or Course not found during verification.' });
        }

        // 3. Save Order to Database
        const order = await Order.create({
            user: user._id,
            course: course._id,
            amount: amount, // Stored in Rupees
            paymentMethod: 'razorpay',
            status: 'completed',
            orderId: razorpay_order_id // Use Razorpay's Order ID
        });

        // 4. Enroll User
        const alreadyEnrolled = user.enrolledCourses.some(c => c.courseSlug === courseSlug);
        if (!alreadyEnrolled) {
            user.enrolledCourses.push({ courseSlug, progress: 0 });
            await user.save();
        }

        // 5. Send Enrollment Confirmation Email
        try {
            const frontendBaseUrl = req.headers.origin || 'http://localhost:5173';
            const dashboardUrl = `${frontendBaseUrl}/#/dashboard`;
            const emailMessage = `
                Dear ${user.name},

                Congratulations! Your enrollment in the "${course.name}" program is confirmed.
                
                Your order ID is: ${razorpay_order_id}
                
                You can start your learning journey right away by visiting your dashboard:
                ${dashboardUrl}
                
                We are excited to have you with us.
                
                Best Regards,
                The SED Team
            `;
        
            await sendEmail({
                email: user.email,
                subject: `Enrollment Confirmation: ${course.name}`,
                message: emailMessage,
            });
        } catch (emailError) {
            console.error("Enrollment confirmation email failed to send:", emailError);
            // Do not fail the transaction if the email fails. Just log it.
        }

        res.status(201).json({
            message: "Payment verified and order created successfully",
            orderId: order.orderId,
            paymentMethod: order.paymentMethod,
            transactionDate: order.createdAt
        });

    } catch (error) {
        console.error("Payment Verification Failed:", error);
        res.status(500).json({ message: 'Server Error during payment verification' });
    }
});


// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private/Student
router.get('/my-orders', protectStudent, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const orders = await Order.find({ user: user._id })
            .populate('course', 'name slug')
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching orders' });
    }
});

// @desc    Get all orders (For Analytics)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protectAdmin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('course', 'name slug pricing');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching orders' });
    }
});

module.exports = router;