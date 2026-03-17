const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const salonRoutes = require("./routes/salonRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

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

// Error handling middleware
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
