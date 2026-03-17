const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import logger and utilities
const logger = require("./utils/logger");

// Import database
const pool = require("./config/db");

// Import routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const salonRoutes = require("./routes/salonRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

// Import error handling
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Test database connection
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    logger.info("Database connection successful", { timestamp: result.rows[0] });
    console.log("✅ Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    logger.error("Database connection failed", { error: error.message, url: process.env.DATABASE_URL });
    console.error("❌ Database connection failed:", error.message);
    console.error("Connection string:", process.env.DATABASE_URL);
    return false;
  }
};

// Security middleware
app.use(helmet()); // Set HTTP headers for security

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        statusCode: 429,
        error: "Too Many Requests",
        message: "Too many requests from this IP, please try again later"
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
        success: false,
        statusCode: 429,
        error: "Too Many Requests",
        message: "Too many login attempts, please try again later"
    }
});

// Apply rate limiting
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// Middleware setup
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`;
        
        if (res.statusCode >= 400) {
            logger.warn(message, { 
                method: req.method, 
                path: req.path, 
                statusCode: res.statusCode,
                duration,
                userId: req.user?.id
            });
        } else {
            logger.info(message, {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration,
                userId: req.user?.id
            });
        }
    });
    
    next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/owner", ownerRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Saluun Backend Running 🚀");
});

// 404 Not Found handler
app.use((req, res, next) => {
    const error = new Error(`Route ${req.path} not found`);
    error.statusCode = 404;
    next(error);
});

// Error handling middleware (MUST be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } else {
    console.error("⚠️  Server starting without database connection. Check your PostgreSQL server and DATABASE_URL.");
    app.listen(PORT, () => {
      console.log(`⚠️  Server running on port ${PORT} (Database connection failed)`);
    });
  }
};

startServer();
