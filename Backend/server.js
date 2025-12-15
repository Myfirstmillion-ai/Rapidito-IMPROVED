require("dotenv").config();

// MEDIUM-005: Validate required environment variables at startup
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_DEV_URL'];
const productionEnvVars = ['MONGODB_PROD_URL', 'CLIENT_URL'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (process.env.ENVIRONMENT === 'production') {
  const missingProdVars = productionEnvVars.filter(varName => !process.env[varName]);
  missingVars.push(...missingProdVars);
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const socket = require("./socket");
const express = require("express");
const { createServer } = require("http");
const app = express();
const server = createServer(app);

socket.initializeSocket(server);

const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet"); // CRITICAL-008: Security headers
const rateLimit = require("express-rate-limit"); // CRITICAL-007: Rate limiting
const mongoSanitize = require("express-mongo-sanitize"); // MEDIUM-016: NoSQL injection prevention

const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const mailRoutes = require("./routes/mail.routes");
const ratingRoutes = require("./routes/rating.routes");
const uploadRoutes = require("./routes/upload.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const passport = require("./config/passport");
const keepServerRunning = require("./services/active.service");
const dbStream = require("./services/logging.service");
require("./config/db");
const PORT = process.env.PORT || 4000;

if (process.env.ENVIRONMENT == "production") {
  app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]", {
      stream: dbStream,
    })
  );
} else {
  app.use(morgan("dev"));
}

// Configure CORS based on environment
const corsOptions = {
  origin: process.env.ENVIRONMENT === "production"
    ? (process.env.CLIENT_URL || (() => {
        console.error("CRITICAL: CLIENT_URL not set in production. Refusing to start.");
        process.exit(1);
      })()) // Only allow specific origin in production
    : "*", // Allow all origins in development
  credentials: true, // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200
};

// CRITICAL-008: Apply Helmet.js for security headers
app.use(helmet());

app.use(cors(corsOptions));
app.use(cookieParser());

// HIGH-011: Add input size limits to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// MEDIUM-016: Sanitize inputs to prevent NoSQL injection
app.use(mongoSanitize());

// Initialize Passport for OAuth
app.use(passport.initialize());

// CRITICAL-007: Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const rideCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 ride creations per minute
  message: { message: "Too many ride requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all requests
app.use(generalLimiter);

if (process.env.ENVIRONMENT == "production") {
  keepServerRunning();
}

app.get("/", (req, res) => {
  res.json("Hello, World!");
});

app.get("/reload", (req, res) => {
  res.json("Server Reloaded");
});

// MEDIUM-008: Health check endpoint for monitoring
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const healthcheck = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.ENVIRONMENT || "development"
  };
  res.status(200).json(healthcheck);
});

// Apply auth rate limiter to login/register routes
app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);
app.use("/captain/login", authLimiter);
app.use("/captain/register", authLimiter);

// Apply ride creation rate limiter
app.use("/ride/create", rideCreationLimiter);

app.use("/user", userRoutes);
app.use("/captain", captainRoutes);
app.use("/map", mapsRoutes);
app.use("/ride", rideRoutes);
app.use("/mail", mailRoutes);
app.use("/ratings", ratingRoutes);
app.use("/upload", uploadRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/profile", require("./routes/profile.routes"));

server.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});

// MEDIUM-006: Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log("HTTP server closed");
    
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed");
      process.exit(0);
    }).catch((err) => {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
