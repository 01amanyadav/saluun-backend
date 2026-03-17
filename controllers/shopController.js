const { getAllSalons, getSalonById, getSalonsByOwner, searchSalons, filterSalons, createSalon, updateSalon, deleteSalon } = require("../models/shopModel");
const asyncHandler = require("../utils/asyncHandler");
const db = require("../config/db");

const getSalons = asyncHandler(async (req, res) => {
    const salons = await getAllSalons();
    res.json(salons);
});

const getSalon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salon = await getSalonById(id);
    
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }
    
    res.json(salon);
});

const createNewSalon = asyncHandler(async (req, res) => {
    const { name, location, description, phone, email, openingTime, closingTime } = req.body;
    const ownerId = req.user.id;

    if (!name || !location) {
        const error = new Error("Name and location are required");
        error.status = 400;
        throw error;
    }

    const salon = await createSalon(ownerId, name, location, description, phone, email, openingTime, closingTime);
    res.status(201).json(salon);
});

const updateSalonDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salon = await getSalonById(id);

    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to update this salon");
        error.status = 403;
        throw error;
    }

    const updatedSalon = await updateSalon(id, req.body);
    res.json(updatedSalon);
});

const deleteSalonById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salon = await getSalonById(id);

    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to delete this salon");
        error.status = 403;
        throw error;
    }

    const deletedSalon = await deleteSalon(id);
    res.json(deletedSalon);
});

const getOwnedSalons = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    const salons = await getSalonsByOwner(ownerId);
    res.json(salons);
});

const searchAndFilter = asyncHandler(async (req, res) => {
    const { search, location, minRating, maxPrice } = req.query;

    let salons;

    if (search) {
        salons = await searchSalons(search);
    } else if (location || minRating || maxPrice) {
        salons = await filterSalons({ location, minRating: parseFloat(minRating), maxPrice: parseFloat(maxPrice) });
    } else {
        salons = await getAllSalons();
    }

    res.json(salons);
});

const getAvailableSlots = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
        const error = new Error("Date parameter is required");
        error.status = 400;
        throw error;
    }

    const salon = await getSalonById(id);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

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
        "SELECT time FROM bookings WHERE salon_id = $1 AND date = $2 AND status != 'cancelled'",
        [id, date]
    );

    const bookedSlots = result.rows.map(b => b.time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ date, availableSlots });
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