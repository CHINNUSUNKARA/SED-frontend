// Load environment variables first (Docker env vars take precedence)
const envPath = require('path').resolve(__dirname, '.env');
require('dotenv').config({ path: envPath, override: false });
const path = require('path');
const resolve = path.resolve;
const join = path.join;
const dns = require('dns')
// Ensure the correct embedding model is used
process.env.EMBEDDING_MODEL = 'jinaai/jina-embeddings-v2-base-en';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MongoDB connection string is not defined in .env file');
  process.exit(1);
}

// Core dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const serviceRoutes = require('./routes/servicesRoutes');
const partnerRoutes = require('./routes/partnersRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const healthCheckRoutes = require('./routes/healthCheck');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contactRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const { router: eventRoutes, broadcastEvent } = require('./routes/eventRoutes');

// Models for seeding
const Course = require('./models/Course.js');
const Partner = require('./models/Partner.js');
const Service = require('./models/Service.js');
const BlogPost = require('./models/BlogPost.js');
const User = require('./models/User.js');
const SuccessStory = require('./models/SuccessStory.js');
let data = { courses: [], partners: [], services: [], blogPosts: [] };
try {
  data = require('./data.js');
} catch (error) {
  console.warn("Warning: ./data.js not found, skipping initial data seeding.");
}

const initialCourses = data.courses || [];
const initialPartners = data.partners || [];
const initialServices = data.services || [];
const initialBlogPosts = data.blogPosts || [];

const initialSuccessStories = [
  {
    name: "Sarah Jenkins",
    role: "Full Stack Developer",
    company: "TechFlow Inc.",
    previousRole: "Marketing Specialist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    story: "I was stuck in a marketing job I didn't enjoy. The Full Stack Bootcamp gave me the skills and confidence to switch careers. I'm now earning double my previous salary and loving my work!",
    outcome: "150% Salary Hike",
    featured: true
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    company: "DataSphere",
    previousRole: "Financial Analyst",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
    story: "Coming from finance, I knew numbers but not coding. This program bridged the gap perfectly. The career support was phenomenal - they helped me polish my resume and ace the interviews.",
    outcome: "Hired at Top Firm",
    featured: true
  },
  {
    name: "Priya Patel",
    role: "Product Designer",
    company: "Creative Studios",
    previousRole: "Graphic Designer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    story: "I wanted to move from graphic design to UX/UI. The curriculum was practical and portfolio-focused. My capstone project directly led to my job offer at Creative Studios.",
    outcome: "Career Pivot",
    featured: true
  },
  {
    name: "David Wilson",
    role: "Cloud Engineer",
    company: "SkyHigh Cloud",
    previousRole: "IT Support",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    story: "Leveling up from IT support to Cloud Engineering seemed impossible, but the structured learning path made it achievable. The hands-on labs were the game changer for me.",
    outcome: "Senior Role",
    featured: true
  }
];

const app = express();
// Enable trust proxy for Render (required for rate limiting to work correctly behind load balancers)
app.set('trust proxy', 1);
const port = process.env.PORT || 5000;


// ---------------- SECURITY & PERFORMANCE MIDDLEWARE ----------------
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       imgSrc: [
//         "'self'", "data:", "blob:",
//         "https://res.cloudinary.com",
//         "https://*.googleusercontent.com",
//         "https://images.unsplash.com",
//         "https://ui-avatars.com",
//         "https://i.pravatar.cc",
//         "https://www.svgrepo.com",
//         "https://www.transparenttextures.com",
//         "https://www.google.com",
//         "https://img-prod-cms-rt-microsoft-com.akamaized.net",
//         "https://www.microsoft.com",
//         "https://upload.wikimedia.org"
//       ],
//       connectSrc: ["'self'", "https://*.googleapis.com", "https://*.stripe.com", "https://accounts.google.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'self'", "https://js.stripe.com", "https://accounts.google.com"]
//     },
//   },
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginEmbedderPolicy: false,
//   crossOriginOpenerPolicy: { policy: "same-origin" },
//   referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
//   xssFilter: true,
//   noSniff: true,
//   ieNoOpen: true,
//   hidePoweredBy: true,
//   frameguard: { action: 'deny' }
// }));

// ---------------- PARSERS ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// // Enable ETag for caching
// app.set('etag', 'strong');

// ---------------- CSRF SETUP ----------------
// Configure CSRF protection
// const csrfProtection = csrf({
//   cookie: {
//     key: '_csrf',
//     httpOnly: true, // The cookie is not accessible via JavaScript
//     secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
//     sameSite: 'lax', // Protection against CSRF attacks
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// });

// Apply CSRF protection selectively. We do NOT apply the CSRF middleware globally
// because that would validate every request before our exclusion logic runs
// (causing POSTs like register to be rejected). Instead, call `csrfProtection`
// inside a conditional middleware so we can exclude specific routes.
// app.use((req, res, next) => {
//   // List of routes to exclude from CSRF protection
//   // Note: we DO NOT exclude the csrf-token endpoint because it must run
//   // the CSRF middleware to generate and attach a token on GET requests.
//   const csrfExcluded = [
//     '/api/auth/login',
//     '/api/auth/register',
//     '/api/auth/google-login',
//     '/api/contact', // Public contact form
//     '/api/health', // Add health check endpoint
//     '/api/ai/chat' // Exclude AI chat endpoint from CSRF
//   ];

//   if (csrfExcluded.some(path => req.path.startsWith(path))) {
//     return next();
//   }

//   // For all non-excluded routes, run the CSRF middleware. For safe methods
//   // (GET/HEAD/OPTIONS) csurf will attach `req.csrfToken()` without rejecting;
//   // for unsafe methods (POST/PUT/DELETE) it will validate the token.
// });

// CSRF token endpoint (used by frontend)
// app.get('/api/auth/csrf-token', (req, res) => {
//   try {
//     // Generate and return CSRF token
//     const csrfToken = req.csrfToken();
//     if (!csrfToken) {
//       throw new Error('CSRF token generation failed');
//     }

//     // Set a non-httpOnly cookie for the frontend to read
//     res.cookie('XSRF-TOKEN', csrfToken, {
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       httpOnly: false // Allow client-side JavaScript to read this cookie
//     });

//     res.json({ csrfToken });
//   } catch (error) {
//     console.error('Error generating CSRF token:', error);
//     res.status(500).json({
//       error: 'Failed to generate CSRF token',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // --------------- LOGGING ----------------
// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on("finish", () =>
//     console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`)
//   );
//   next();
// });

// --------------- RATE LIMITING ----------------
// More generous rate limits for better performance
// app.use('/api', rateLimit({ 
//   windowMs: 15 * 60 * 1000, 
//   max: 500, // Increased from 200
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => {
//     // Skip rate limiting for health checks and static assets
//     return req.path === '/api/health' || req.path.startsWith('/uploads');
//   }
// }));

// app.use('/api/auth', rateLimit({ 
//   windowMs: 15 * 60 * 1000, 
//   max: 100, // Increased from 50
//   standardHeaders: true,
//   legacyHeaders: false
// }));

// --------------- STATIC ----------------
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/dashboard", adminRoutes);
app.use("/api/notifications", require('./routes/notificationRoutes'));
app.use("/api/instructor", require('./routes/instructorRoutes')); // Register Instructor Routes
app.use("/api/assignments", require('./routes/assignmentRoutes'));
app.use("/api/certificates", require('./routes/certificateRoutes'));
app.use("/api/submissions", require('./routes/submissionsRoutes'));
app.use("/api/success-stories", require('./routes/successStoryRoutes'));
app.use("/api/contact", contactRoutes);
app.use("/api/health", healthCheckRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/events", eventRoutes);

// Make broadcastEvent available globally for course updates
global.broadcastEvent = broadcastEvent;

// ---------------- ERROR HANDLER ----------------
app.use('/api', notFound);
app.use(errorHandler);

// ---------------- START SERVER & DB LOGIC ----------------

let server; // Define server globally so error handlers can access it

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    if (!uri) throw new Error("Could not find MONGODB_URI in Secrets or Env.");

    // Set DNS servers for faster resolution
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
    
    // Optimized MongoDB connection options
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 10000, // Increased from 5000
      socketTimeoutMS: 45000,
      maxPoolSize: 50, // Connection pooling
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      compressors: ['zlib'], // Enable compression
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 10000,
    });
    
    // Enable query result caching
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    console.log("✅ Server DB Connected with optimized settings");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  // await seedData(); // Execute the seeding logic you defined
  
  // Start Express listener
  server = app.listen(port, () => {
    const environment = process.env.NODE_ENV || 'development';
    console.log(`=======================================================`);
    console.log(`🚀 Server running successfully in ${environment} mode!`);
    console.log(`📡 URL: http://localhost:${port}`);
    console.log(`=======================================================`);
  });
};

// Handle unhandled promise rejections safely
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Production Graceful Shutdown (SIGTERM/SIGINT)
const gracefulShutdown = () => {
  console.log('\n⚠️ Received kill signal, shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('🛑 HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('🛑 MongoDB connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the sequence
startServer();

module.exports = app;