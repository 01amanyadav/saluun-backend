const { getSalonsByOwner, getSalonById } = require("../models/shopModel");
const { getSalonAnalytics, getSalonStats, updateSalonAnalytics } = require("../models/analyticsModel");
const { getSalonBookings, getBookingsByDate } = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");

const getOwnerSalons = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    
    if (req.user.role !== "salon_owner" && req.user.role !== "admin") {
        const error = new Error("Only salon owners can access this");
        error.status = 403;
        throw error;
    }

    const salons = await getSalonsByOwner(ownerId);
    res.json(salons);
});

const getSalonAnalyticsData = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const { startDate, endDate } = req.query;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to view this salon's analytics");
        error.status = 403;
        throw error;
    }

    const analytics = await getSalonAnalytics(salonId, startDate, endDate);
    const stats = await getSalonStats(salonId);

    res.json({
        salon: salon,
        overallStats: stats,
        dailyAnalytics: analytics
    });
});

const refreshSalonAnalytics = asyncHandler(async (req, res) => {
    const { salonId } = req.params;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to update this salon's analytics");
        error.status = 403;
        throw error;
    }

    const updated = await updateSalonAnalytics(salonId);
    res.json(updated);
});

const getOwnerDashboard = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;

    if (req.user.role !== "salon_owner" && req.user.role !== "admin") {
        const error = new Error("Only salon owners can access this");
        error.status = 403;
        throw error;
    }

    const salons = await getSalonsByOwner(ownerId);
    
    const dashboardData = {
        totalSalons: salons.length,
        salons: []
    };

    for (const salon of salons) {
        const bookings = await getSalonBookings(salon.id);
        const stats = await getSalonStats(salon.id);
        
        dashboardData.salons.push({
            salon: salon,
            totalBookings: bookings.length,
            todayBookings: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
            stats: stats
        });
    }

    res.json(dashboardData);
});

const getSalonBookingsList = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const { date } = req.query;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to view this salon's bookings");
        error.status = 403;
        throw error;
    }

    let bookings;
    if (date) {
        bookings = await getBookingsByDate(salonId, date);
    } else {
        bookings = await getSalonBookings(salonId);
    }

    res.json(bookings);
});

module.exports = {
    getOwnerSalons,
    getSalonAnalyticsData,
    refreshSalonAnalytics,
    getOwnerDashboard,
    getSalonBookingsList
};
