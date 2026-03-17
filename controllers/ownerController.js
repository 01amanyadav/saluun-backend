const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const OwnerAnalyticsService = require("../services/ownerAnalyticsService");


const getOwnerSalons = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await OwnerAnalyticsService.getOwnerSalonsWithAnalytics(ownerId, page, limit);
    res.json(formatSuccessResponse(result, "Owner salons fetched"));
});


const getSalonAnalyticsData = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const ownerId = req.user.id;

    const analytics = await OwnerAnalyticsService.getSalonAnalytics(salonId, ownerId);
    res.json(formatSuccessResponse(analytics, "Salon analytics fetched"));
});


const refreshSalonAnalytics = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const ownerId = req.user.id;

    const analytics = await OwnerAnalyticsService.getSalonAnalytics(salonId, ownerId);
    res.json(formatSuccessResponse(analytics, "Salon analytics refreshed"));
});


const getOwnerDashboard = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;

    const dashboard = await OwnerAnalyticsService.getOwnerDashboard(ownerId);
    res.json(formatSuccessResponse(dashboard, "Owner dashboard fetched"));
});


const getSalonBookingsList = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const { date } = req.query;
    const ownerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {};
    if (date) {
        filters.startDate = date;
        filters.endDate = date;
    }

    const result = await OwnerAnalyticsService.getBookingStatsWithPagination(ownerId, filters, page, limit);
    res.json(formatSuccessResponse(result, "Salon bookings fetched"));
});


module.exports = {
    getOwnerSalons,
    getSalonAnalyticsData,
    refreshSalonAnalytics,
    getOwnerDashboard,
    getSalonBookingsList
};
