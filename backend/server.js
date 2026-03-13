// Load environment variables first (Docker env vars take precedence)
const envPath = require('path').resolve(__dirname, '.env');
require('dotenv').config({ path: envPath, override: false });
const path = require('path');
const resolve = path.resolve;
const join = path.join;

// Ensure the correct embedding model is used
process.env.EMBEDDING_MODEL = 'jinaai/jina-embeddings-v2-base-en';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MongoDB connection string is not defined in .env file');
  process.exit(1);
}

// Core dependencies
const express = require('express');
import cors from 'cors';

// Allow your frontend domain(s) to call your backend
app.use(cors({
  origin: [
    'https://www.scholastic-edu-depot.com',
    'https://scholastic-edu-depot.com'
  ],
  credentials: true, // needed if your backend uses cookies or sessions
}));
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

// ---------------- MONGODB CONNECTION ----------------
const connectDB = async () => {
  try {
    // Parse the MongoDB URI to ensure it's valid
    let mongoUri = MONGO_URI;

    // Ensure the connection string has the correct format
    if (!mongoUri.includes('retryWrites')) {
      mongoUri += (mongoUri.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority';
    }

    console.log('Attempting to connect to MongoDB...');

    // Connect with modern options
    const sslEnabled = mongoUri.includes('ssl=true') || mongoUri.includes('mongodb+srv://');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      retryWrites: true,
      w: 'majority',
      ssl: sslEnabled,
      tls: sslEnabled,
      // Removed tlsInsecure as it conflicts with tlsAllowInvalidCertificates
      tlsAllowInvalidCertificates: false, // Set to false for production Atlas
      tlsAllowInvalidHostnames: false,    // Set to false for production Atlas
      family: 4, // Use IPv4
      // Add server API for MongoDB 5.0+
      serverApi: {
        version: '1',
        strict: false,
        deprecationErrors: true,
      },
      // Connection pool options
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 1,  // Minimum number of connections in the connection pool
    });

    console.log('Successfully connected to MongoDB');

    // Seed initial data if needed
    try {
      await seedData();
    } catch (seedError) {
      console.error('Error seeding data:', seedError);
      // Don't exit if seeding fails, as the app might still work
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Connection details:', {
      host: mongoose.connection?.host,
      port: mongoose.connection?.port,
      name: mongoose.connection?.name
    });
    console.error('Please check your MongoDB Atlas connection string and ensure your IP is whitelisted.');
    process.exit(1);
  }
};


// ---------------- SECURITY MIDDLEWARE ----------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: [
        "'self'", "data:", "blob:",
        "https://res.cloudinary.com",
        "https://*.googleusercontent.com",
        "https://images.unsplash.com",
        "https://ui-avatars.com",
        "https://i.pravatar.cc",
        "https://www.svgrepo.com",
        "https://www.transparenttextures.com",
        "https://www.google.com",
        "https://img-prod-cms-rt-microsoft-com.akamaized.net",
        "https://www.microsoft.com",
        "https://upload.wikimedia.org"
      ],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.stripe.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://accounts.google.com"]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  ieNoOpen: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' }
}));

// CORS Configuration
// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace('https://', 'https://www.') : '',
  'https://scholastic-edu-depot.com',
  'https://www.scholastic-edu-depot.com'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 hours
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ---------------- PARSERS ----------------
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ---------------- CSRF SETUP ----------------
// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true, // The cookie is not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'lax', // Protection against CSRF attacks
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Apply CSRF protection selectively. We do NOT apply the CSRF middleware globally
// because that would validate every request before our exclusion logic runs
// (causing POSTs like register to be rejected). Instead, call `csrfProtection`
// inside a conditional middleware so we can exclude specific routes.
app.use((req, res, next) => {
  // List of routes to exclude from CSRF protection
  // Note: we DO NOT exclude the csrf-token endpoint because it must run
  // the CSRF middleware to generate and attach a token on GET requests.
  const csrfExcluded = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/google-login',
    '/api/contact', // Public contact form
    '/api/health', // Add health check endpoint
    '/api/ai/chat' // Exclude AI chat endpoint from CSRF
  ];

  if (csrfExcluded.some(path => req.path.startsWith(path))) {
    return next();
  }

  // For all non-excluded routes, run the CSRF middleware. For safe methods
  // (GET/HEAD/OPTIONS) csurf will attach `req.csrfToken()` without rejecting;
  // for unsafe methods (POST/PUT/DELETE) it will validate the token.
  return csrfProtection(req, res, next);
});

// CSRF token endpoint (used by frontend)
app.get('/api/auth/csrf-token', (req, res) => {
  try {
    // Generate and return CSRF token
    const csrfToken = req.csrfToken();
    if (!csrfToken) {
      throw new Error('CSRF token generation failed');
    }

    // Set a non-httpOnly cookie for the frontend to read
    res.cookie('XSRF-TOKEN', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: false // Allow client-side JavaScript to read this cookie
    });

    res.json({ csrfToken });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// --------------- LOGGING ----------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () =>
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`)
  );
  next();
});

// --------------- RATE LIMITING ----------------
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

// --------------- STATIC ----------------
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Remove duplicate MongoDB connection - using the one in connectDB() instead

async function seedData() {
  try {
    if (await Course.countDocuments() === 0) await Course.insertMany(initialCourses);
    if (await Partner.countDocuments() === 0) await Partner.insertMany(initialPartners);
    if (await Service.countDocuments() === 0) await Service.insertMany(initialServices);
    if (await BlogPost.countDocuments() === 0) await BlogPost.insertMany(initialBlogPosts);
    if (await SuccessStory.countDocuments() === 0) await SuccessStory.insertMany(initialSuccessStories);

    if (await User.countDocuments() === 0) {
      const salt = bcrypt.genSaltSync(10);
      await User.insertMany([
        { name: 'Admin User', email: 'admin@sed.com', password: bcrypt.hashSync('adminpassword123', salt), role: 'Admin' },
        { name: 'Student User', email: 'student@example.com', password: bcrypt.hashSync('password123', salt), role: 'Student' },
      ]);
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

// ---------------- ROUTES ----------------
// Test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({
    status: 'success',
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

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

// ---------------- STATIC ASSETS ----------------
// Note: Frontend is served separately via Docker container

// ---------------- ERROR HANDLER ----------------
app.use('/api', notFound);
app.use(errorHandler);

// ---------------- START SERVER ----------------
// Only start the server after MongoDB is connected
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start the server
startServer();

module.exports = app;
