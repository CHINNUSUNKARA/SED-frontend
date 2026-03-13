// ---------------- ENV CONFIG ----------------
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
  override: false,
});

// Ensure embedding model
process.env.EMBEDDING_MODEL = "jinaai/jina-embeddings-v2-base-en";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MongoDB connection string missing in .env");
  process.exit(1);
}

// ---------------- DEPENDENCIES ----------------
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bcrypt = require("bcryptjs");

// ---------------- ROUTES ----------------
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const serviceRoutes = require("./routes/servicesRoutes");
const partnerRoutes = require("./routes/partnersRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const healthCheckRoutes = require("./routes/healthCheck");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

const { router: eventRoutes, broadcastEvent } = require("./routes/eventRoutes");

// ---------------- MIDDLEWARE ----------------
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ---------------- APP ----------------
const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// ---------------- DATABASE ----------------
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB Connected:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

// ---------------- SECURITY ----------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ---------------- CORS ----------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://scholastic-edu-depot.com",
  "https://www.scholastic-edu-depot.com",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------------- BODY PARSER ----------------
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compression());

// ---------------- RATE LIMIT ----------------
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// ---------------- CSRF ----------------
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

app.use((req, res, next) => {
  const excluded = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google-login",
    "/api/contact",
    "/api/health",
  ];

  if (excluded.some((path) => req.path.startsWith(path))) {
    return next();
  }

  return csrfProtection(req, res, next);
});

// CSRF token endpoint
app.get("/api/auth/csrf-token", (req, res) => {
  const token = req.csrfToken();

  res.cookie("XSRF-TOKEN", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: false,
  });

  res.json({ csrfToken: token });
});

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("SED Platform API is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "Backend working",
    time: new Date(),
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
app.use("/api", notFound);
app.use(errorHandler);

// ---------------- START SERVER ----------------
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
