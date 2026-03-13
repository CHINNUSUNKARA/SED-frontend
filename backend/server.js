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
    story: "I was stuck in a marketing job I didn't enjoy. The Full Stack Bootcamp gave me the skills and confidence to switch careers.",
    outcome: "150% Salary Hike",
    featured: true
  }
];

const app = express();
app.set('trust proxy', 1);

const port = process.env.PORT || 5000;

// ---------------- MONGODB CONNECTION ----------------
const connectDB = async () => {
  try {

    let mongoUri = MONGO_URI;

    if (!mongoUri.includes('retryWrites')) {
      mongoUri += (mongoUri.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority';
    }

    console.log('Attempting to connect to MongoDB...');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('Successfully connected to MongoDB');

    await seedData();

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// ---------------- SECURITY ----------------
app.use(helmet());

// ---------------- CORS ----------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
  'https://scholastic-edu-depot.com',
  'https://www.scholastic-edu-depot.com'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }

  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ---------------- PARSERS ----------------
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compression());

// ---------------- RATE LIMIT ----------------
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

// ---------------- TEST ROUTE ----------------
app.get('/api/test', (req, res) => {

  res.json({
    status: 'success',
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });

});

// ---------------- ROUTES ----------------
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
app.use("/api/contact", contactRoutes);
app.use("/api/health", healthCheckRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/events", eventRoutes);

// ---------------- ERROR HANDLER ----------------
app.use('/api', notFound);
app.use(errorHandler);

// ---------------- START SERVER ----------------
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

startServer();

module.exports = app;
