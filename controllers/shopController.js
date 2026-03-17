const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const SalonService = require("../services/salonService");
const db = require("../config/db");


const getSalons = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await SalonService.getAllSalonsWithPagination(page, limit);
    res.json(formatSuccessResponse(result, "Salons fetched successfully"));
});


const getSalon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salon = await SalonService.getSalonDetails(id);
    res.json(formatSuccessResponse(salon, "Salon details fetched"));
});


const createNewSalon = asyncHandler(async (req, res) => {
    const { name, location, description, phone, email, openingTime, closingTime } = req.body;
    const ownerId = req.user.id;

    const salonData = {
        name,
        location,
        description,
        phone,
        email,
        openingTime,
        closingTime
    };

    const salon = await SalonService.createNewSalon(ownerId, salonData);
    res.status(201).json(formatSuccessResponse(salon, "Salon created successfully"));
});


const updateSalonDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    const updatedSalon = await SalonService.updateSalonInfo(id, ownerId, req.body);
    res.json(formatSuccessResponse(updatedSalon, "Salon updated successfully"));
});


const deleteSalonById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    const deletedSalon = await SalonService.removeSalon(id, ownerId);
    res.json(formatSuccessResponse(deletedSalon, "Salon deleted successfully"));
});


const getOwnedSalons = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await SalonService.getOwnerSalonsWithPagination(ownerId, page, limit);
    res.json(formatSuccessResponse(result, "Owner salons fetched"));
});


const searchAndFilter = asyncHandler(async (req, res) => {
    const { search, location, minRating, maxPrice } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let result;

    if (search) {
        result = await SalonService.searchSalonsWithPagination(search, page, limit);
    } else if (location || minRating || maxPrice) {
        const filters = { location, minRating: parseFloat(minRating), maxPrice: parseFloat(maxPrice) };
        result = await SalonService.filterSalonsWithPagination(filters, page, limit);
    } else {
        result = await SalonService.getAllSalonsWithPagination(page, limit);
    }

    res.json(formatSuccessResponse(result, "Search/filter results"));
});


const getAvailableSlots = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
        const error = new Error("Date parameter is required");
        error.status = 400;
        throw error;
    }

    const salon = await SalonService.getSalonDetails(id);

    const allSlots = [
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "13:00", "13:30",
        "14:00", "14:30",
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00", "17:30",
        "18:00", "18:30"
    ];

    const result = await db.query(
        "SELECT time_slot FROM bookings WHERE salon_id = $1 AND booking_date = $2 AND status != 'cancelled'",
        [id, date]
    );

    const bookedSlots = result.rows.map(b => b.time_slot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json(formatSuccessResponse({ date, availableSlots }, "Available slots fetched"));
});


module.exports = {
    getSalons,
    getSalon,
    createNewSalon,
    updateSalonDetails,
    deleteSalonById,
    getOwnedSalons,
    searchAndFilter,
    getAvailableSlots
};