const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getOwnerSalons,
    getSalonAnalyticsData,
    refreshSalonAnalytics,
    getOwnerDashboard,
    getSalonBookingsList
} = require("../controllers/ownerController");

// Protected routes - Salon Owner Only
router.get("/dashboard", authMiddleware, getOwnerDashboard);
router.get("/salons", authMiddleware, getOwnerSalons);
router.get("/:salonId/analytics", authMiddleware, getSalonAnalyticsData);
router.post("/:salonId/analytics/refresh", authMiddleware, refreshSalonAnalytics);
router.get("/:salonId/bookings", authMiddleware, getSalonBookingsList);

module.exports = router;
