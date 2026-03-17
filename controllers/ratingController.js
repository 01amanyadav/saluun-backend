const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const RatingService = require("../services/ratingService");


const addRating = asyncHandler(async (req, res) => {
    const { salonId, rating, review, bookingId } = req.body;
    const userId = req.user.id;

    const newRating = await RatingService.addRatingForSalon(
        userId,
        salonId,
        rating,
        review,
        bookingId
    );

    res.status(201).json(formatSuccessResponse(newRating, "Rating added successfully"));
});


const getSalonRatings = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await RatingService.getSalonRatingsWithPagination(salonId, page, limit);
    res.json(formatSuccessResponse(result, "Salon ratings fetched"));
});


const getSalonAverageRating = asyncHandler(async (req, res) => {
    const { salonId } = req.params;

    const rating = await RatingService.getSalonAverageRating(salonId);
    res.json(formatSuccessResponse(rating, "Salon average rating fetched"));
});


const updateUserRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const updatedRating = await RatingService.updateUserRating(ratingId, userId, rating, review);
    res.json(formatSuccessResponse(updatedRating, "Rating updated successfully"));
});


const deleteUserRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const deletedRating = await RatingService.deleteUserRating(ratingId, userId);
    res.json(formatSuccessResponse(deletedRating, "Rating deleted successfully"));
});


module.exports = {
    addRating,
    getSalonRatings,
    getSalonAverageRating,
    updateUserRating,
    deleteUserRating
};
