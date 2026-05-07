const envPath = require('path').resolve(__dirname, '.env');
require('dotenv').config({ path: envPath, override: false });
const path = require('path');
const resolve = path.resolve;
const join = path.join;
const dns = require('dns')
process.env.EMBEDDING_MODEL = 'jinaai/jina-embeddings-v2-base-en';

const MONGO_URI = process.env.MONGO_URI;

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
const port = process.env.PORT || 5000;


// ---------------- CORS ----------------
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

// ---------------- PARSERS ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
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

global.broadcastEvent = broadcastEvent;

// ---------------- ERROR HANDLER ----------------
app.use('/api', notFound);
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
  server = app.listen(port, () => {
    const environment = process.env.NODE_ENV || 'development';
    console.log(`=======================================================`);
    console.log(`🚀 Server running successfully in ${environment} mode!`);
    console.log(`📡 URL: http://localhost:${port}`);
    console.log(`=======================================================`);
  });
};

startServer();

module.exports = app;