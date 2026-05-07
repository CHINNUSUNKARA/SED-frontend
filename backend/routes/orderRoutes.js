const express = require('express');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
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

// @desc    Enroll in a free course (no payment required)
// @route   POST /api/orders/enroll-free
// @access  Private/Student
router.post('/enroll-free', protectStudent, async (req, res) => {
    const { courseSlug } = req.body;
    if (!courseSlug) {
        return res.status(400).json({ message: 'courseSlug is required.' });
    }

    try {
        const [user, course] = await Promise.all([
            User.findById(req.user.userId),
            Course.findOne({ slug: courseSlug }),
        ]);

        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        const courseAmount = course.pricing?.amount ?? 0;
        if (courseAmount > 0) {
            return res.status(400).json({ message: 'This course requires payment. Use the payment flow.' });
        }

        // Create Enrollment doc (upsert — idempotent)
        const enrollment = await Enrollment.findOneAndUpdate(
            { student: user._id, course: course._id },
            {
                $setOnInsert: {
                    student: user._id,
                    course: course._id,
                    order: null,
                    enrolledAt: new Date(),
                    progress: 0,
                    completedLessons: [],
                    amount: 0,
                    paymentStatus: 'free',
                    status: 'in-progress',
                }
            },
            { upsert: true, new: true }
        );

        // Keep user.enrolledCourses in sync
        const alreadyEnrolled = user.enrolledCourses.some(c => c.courseSlug === courseSlug);
        if (!alreadyEnrolled) {
            user.enrolledCourses.push({ courseSlug, progress: 0, completedLessons: [] });
            await user.save();
        }

        res.status(201).json({
            message: 'Enrolled successfully.',
            enrollmentId: enrollment._id,
            courseSlug,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Already enrolled in this course.' });
        }
        console.error('Free enrollment error:', error);
        res.status(500).json({ message: 'Server error during enrollment.' });
    }
});

// @desc    Step 1: Initiate Razorpay Order
// @route   POST /api/orders/create-order
// @access  Private/Student
router.post('/create-order', protectStudent, checkRazorpayConfig, async (req, res) => {
    const { courseSlug, amount } = req.body;

    if (!courseSlug || !amount || amount <= 0) {
        return res.status(400).json({ message: 'courseSlug and a positive amount are required.' });
    }

    try {
        const course = await Course.findOne({ slug: courseSlug });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Razorpay expects amount in paisa (smallest currency unit)
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error('Razorpay order creation failed:', error);
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
router.post('/verify-payment', protectStudent, async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseSlug,
        amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseSlug) {
        return res.status(400).json({ message: 'Missing required payment fields.' });
    }

    try {
        // 1. Cryptographic Signature Verification
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error(`Signature mismatch for order ${razorpay_order_id}. Expected: ${expectedSignature}, Got: ${razorpay_signature}`);
            return res.status(400).json({ message: 'Payment verification failed. Signatures do not match.' });
        }

        // 2. Idempotency — return success if this payment was already processed
        const existingOrder = await Order.findOne({ orderId: razorpay_order_id })
            .populate('course', 'name');
        if (existingOrder) {
            return res.status(200).json({
                message: 'Payment already verified and enrollment confirmed.',
                orderId: existingOrder.orderId,
                paymentMethod: existingOrder.paymentMethod,
                transactionDate: existingOrder.createdAt
            });
        }

        // 3. Fetch User & Course
        const [user, course] = await Promise.all([
            User.findOne({ email: req.user.email }),
            Course.findOne({ slug: courseSlug })
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User account not found.' });
        }
        if (!course) {
            return res.status(404).json({ message: `Course "${courseSlug}" not found.` });
        }

        // 4. Save Order
        const order = await Order.create({
            user: user._id,
            course: course._id,
            amount: amount ?? 0,
            currency: 'INR',
            paymentMethod: 'razorpay',
            status: 'completed',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });

        // 5. Create Enrollment document (upsert — safe if retried)
        await Enrollment.findOneAndUpdate(
            { student: user._id, course: course._id },
            {
                $setOnInsert: {
                    student: user._id,
                    course: course._id,
                    order: order._id,
                    enrolledAt: new Date(),
                    progress: 0,
                    completedLessons: [],
                    amount: amount ?? 0,
                    paymentStatus: 'paid',
                    status: 'in-progress',
                }
            },
            { upsert: true, new: true }
        );

        // 6. Keep user.enrolledCourses in sync (used by progress tracking routes)
        const alreadyEnrolled = user.enrolledCourses.some(c => c.courseSlug === courseSlug);
        if (!alreadyEnrolled) {
            user.enrolledCourses.push({ courseSlug, progress: 0, completedLessons: [] });
            await user.save();
        }

        // 6. Send Enrollment Confirmation Email (non-blocking)
        const frontendBaseUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
        const emailMessage = `Dear ${user.name},

Congratulations! Your enrollment in the "${course.name}" program is confirmed.

Order ID: ${razorpay_order_id}
Payment ID: ${razorpay_payment_id}

You can start your learning journey right away:
${frontendBaseUrl}/dashboard

Best Regards,
The SED Team`;

        sendEmail({
            email: user.email,
            subject: `Enrollment Confirmed: ${course.name}`,
            message: emailMessage,
        }).catch(err => console.error('Enrollment email failed:', err));

        res.status(201).json({
            message: 'Payment verified and enrollment confirmed.',
            orderId: order.orderId,
            paymentMethod: order.paymentMethod,
            transactionDate: order.createdAt
        });

    } catch (error) {
        // Handle duplicate key error from a race condition
        if (error.code === 11000) {
            const existingOrder = await Order.findOne({ orderId: razorpay_order_id });
            if (existingOrder) {
                return res.status(200).json({
                    message: 'Payment already verified and enrollment confirmed.',
                    orderId: existingOrder.orderId,
                    paymentMethod: existingOrder.paymentMethod,
                    transactionDate: existingOrder.createdAt
                });
            }
        }
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Server error during payment verification. Please contact support.' });
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