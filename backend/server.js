// server.js - Full backend for SCHOLASTIC EDU DEPOT

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------- ENV VARIABLES ----------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'https://www.scholastic-edu-depot.com';
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// ---------------- EXPRESS APP ----------------
const app = express();
app.set('trust proxy', 1);

// ---------------- MONGODB CONNECTION ----------------
const connectDB = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI not set in environment variables');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      family: 4,
      serverApi: { version: '1', strict: false, deprecationErrors: true },
      maxPoolSize: 10,
      minPoolSize: 1
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// ---------------- SECURITY ----------------
app.use(helmet({
  contentSecurityPolicy: false,
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

// ---------------- CORS ----------------
const allowedOrigins = [
  CLIENT_URL,
  CLIENT_URL.replace('https://', 'https://www.'),
  'https://scholastic-edu-depot.com',
  'https://www.scholastic-edu-depot.com'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin'],
  exposedHeaders: ['set-cookie']
}));
app.options('*', cors());

// ---------------- PARSERS ----------------
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ---------------- RATE LIMITING ----------------
app.use('/api', rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 50 }));

// ---------------- CSRF ----------------
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite:'lax', maxAge:24*60*60*1000 } });
app.get('/api/auth/csrf-token', csrfProtection, (req,res)=>{
  res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly:false, secure: process.env.NODE_ENV==='production', sameSite:'lax', path:'/' });
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------- GOOGLE OAUTH ----------------
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);

// ---------------- MODELS ----------------
const User = require('./models/User');
const Course = require('./models/Course');
const Partner = require('./models/Partner');
const Service = require('./models/Service');
const BlogPost = require('./models/BlogPost');
const SuccessStory = require('./models/SuccessStory');

// ---------------- SEED DATA ----------------
const initialData = require('./data.js') || {};
const initialCourses = initialData.courses || [];
const initialPartners = initialData.partners || [];
const initialServices = initialData.services || [];
const initialBlogPosts = initialData.blogPosts || [];

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

async function seedData() {
  try {
    if(await Course.countDocuments() === 0) await Course.insertMany(initialCourses);
    if(await Partner.countDocuments() === 0) await Partner.insertMany(initialPartners);
    if(await Service.countDocuments() === 0) await Service.insertMany(initialServices);
    if(await BlogPost.countDocuments() === 0) await BlogPost.insertMany(initialBlogPosts);
    if(await SuccessStory.countDocuments() === 0) await SuccessStory.insertMany(initialSuccessStories);

    if(await User.countDocuments() === 0){
      const salt = bcrypt.genSaltSync(10);
      await User.insertMany([
        { name:'Admin User', email:'admin@sed.com', password:bcrypt.hashSync('adminpassword123',salt), role:'Admin' },
        { name:'Student User', email:'student@example.com', password:bcrypt.hashSync('password123',salt), role:'Student' }
      ]);
    }
    console.log('✅ Initial data seeded');
  } catch(err){
    console.error('❌ Error seeding data:', err);
  }
}

// ---------------- GOOGLE AUTH ROUTES ----------------
app.get('/api/auth/google', (req,res)=>{
  const url = client.generateAuthUrl({
    access_type:'offline',
    scope:['profile','email']
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req,res)=>{
  try{
    const { code } = req.query;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({ idToken:tokens.id_token, audience:GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if(!user){
      const salt = bcrypt.genSaltSync(10);
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: bcrypt.hashSync(Math.random().toString(36).slice(-8), salt),
        role: 'Student'
      });
    }

    const token = jwt.sign({ id:user._id, role:user.role }, JWT_SECRET, { expiresIn:'7d' });
    res.cookie('token', token, { httpOnly:true, secure:true, sameSite:'lax' });
    res.redirect(CLIENT_URL);
  } catch(err){
    console.error('Google OAuth error:', err);
    res.status(500).send('Authentication failed');
  }
});

// ---------------- STATIC ----------------
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// ---------------- IMPORT AND USE ROUTES ----------------
// Replace with your actual route imports
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/coursesRoutes'));
app.use('/api/partners', require('./routes/partnersRoutes'));
app.use('/api/services', require('./routes/servicesRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminUserRoutes'));
app.use('/api/admin/dashboard', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/submissions', require('./routes/submissionsRoutes'));
app.use('/api/success-stories', require('./routes/successStoryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/health', require('./routes/healthCheck'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
const { router: eventRoutes, broadcastEvent } = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
global.broadcastEvent = broadcastEvent;

// ---------------- TEST ROUTE ----------------
app.get('/api/test', (req,res)=> res.json({ status:'success', message:'Backend is working!' }));

// ---------------- ERROR HANDLER ----------------
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use('/api', notFound);
app.use(errorHandler);

// ---------------- START SERVER ----------------
const startServer = async ()=>{
  await connectDB();
  await seedData();
  app.listen(PORT, ()=> console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
