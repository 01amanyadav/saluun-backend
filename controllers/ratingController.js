const { createRating, getRatingsBySalon, getSalonRating, checkUserRating, updateRating, deleteRating } = require("../models/ratingModel");
const { getSalonById } = require("../models/shopModel");
const asyncHandler = require("../utils/asyncHandler");

const addRating = asyncHandler(async (req, res) => {
    const { salonId, rating, review, bookingId } = req.body;
    const userId = req.user.id;

    if (!salonId || !rating || rating < 1 || rating > 5) {
        const error = new Error("Valid salon ID and rating (1-5) are required");
        error.status = 400;
        throw error;
    }

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    const existingRating = await checkUserRating(userId, salonId);
    if (existingRating) {
        const error = new Error("You have already rated this salon");
        error.status = 400;
        throw error;
    }

    const newRating = await createRating(userId, salonId, rating, review, bookingId);
    res.status(201).json(newRating);
});

const getSalonRatings = asyncHandler(async (req, res) => {
    const { salonId } = req.params;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    const ratings = await getRatingsBySalon(salonId);
    const salonRating = await getSalonRating(salonId);

    res.json({
        salon: salon,
        averageRating: salonRating.average_rating || 0,
        totalRatings: salonRating.total_ratings || 0,
        ratings: ratings
    });
});

const getSalonAverageRating = asyncHandler(async (req, res) => {
    const { salonId } = req.params;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    const salonRating = await getSalonRating(salonId);
    res.json(salonRating);
});

const updateUserRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        const error = new Error("Valid rating (1-5) is required");
        error.status = 400;
        throw error;
    }

    // Check if user owns this rating
    const ratingData = await getRatingsBySalon(0).then(() => ({ user_id: userId })); // Placeholder
    
    const updatedRating = await updateRating(ratingId, rating, review);
    res.json(updatedRating);
});

const deleteUserRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;

    const deletedRating = await deleteRating(ratingId);
    res.json(deletedRating);
});

module.exports = {
    addRating,
    getSalonRatings,
    getSalonAverageRating,
    updateUserRating,
    deleteUserRating
};
