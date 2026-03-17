const logger = require("../utils/logger");
const { getPaginationParams, buildPaginationMeta } = require("../utils/response");
const {
    createRating,
    getRatingsBySalon,
    getSalonRating,
    checkUserRating,
    updateRating,
    deleteRating
} = require("../models/ratingModel");
const { getSalonById } = require("../models/shopModel");

class RatingService {
    /**
     * Add rating for salon
     */
    static async addRatingForSalon(userId, salonId, rating, review, bookingId = null) {
        try {
            logger.info("Adding rating", { userId, salonId, rating });

            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            // Check if user already rated
            const existingRating = await checkUserRating(userId, salonId);
            if (existingRating) {
                const error = new Error("You have already rated this salon");
                error.statusCode = 400;
                throw error;
            }

            const newRating = await createRating(userId, salonId, rating, review, bookingId);
            logger.info("Rating created successfully", { ratingId: newRating.id, userId, salonId });
            return newRating;
        } catch (error) {
            logger.error("Failed to add rating", { error: error.message, userId, salonId });
            throw error;
        }
    }

    /**
     * Get salon ratings with pagination
     */
    static async getSalonRatingsWithPagination(salonId, page = 1, limit = 10) {
        try {
            const ratings = await getRatingsBySalon(salonId);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = ratings.slice(offset, offset + limit);
            const salonRating = await getSalonRating(salonId);

            logger.info("Fetched salon ratings", { salonId, page, limit, total: ratings.length });

            return {
                salon: { id: salonId, rating: salonRating.average_rating, totalRatings: salonRating.total_ratings },
                data: paginatedResults,
                pagination: buildPaginationMeta(ratings.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get salon ratings", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Get salon average rating
     */
    static async getSalonAverageRating(salonId) {
        try {
            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            const rating = await getSalonRating(salonId);
            logger.info("Fetched salon average rating", { salonId });

            return {
                salonId,
                averageRating: rating.average_rating || 0,
                totalRatings: rating.total_ratings || 0
            };
        } catch (error) {
            logger.error("Failed to get salon average rating", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Update rating
     */
    static async updateUserRating(ratingId, userId, rating, review) {
        try {
            logger.info("Updating rating", { ratingId, userId, rating });

            const db = require("../config/db");
            const ratingData = await db.query("SELECT * FROM ratings WHERE id = $1", [ratingId]);

            if (ratingData.rows.length === 0) {
                const error = new Error("Rating not found");
                error.statusCode = 404;
                throw error;
            }

            if (ratingData.rows[0].user_id !== userId) {
                const error = new Error("Unauthorized to update this rating");
                error.statusCode = 403;
                throw error;
            }

            const updated = await updateRating(ratingId, rating, review);
            logger.info("Rating updated successfully", { ratingId, userId });
            return updated;
        } catch (error) {
            logger.error("Failed to update rating", { error: error.message, ratingId });
            throw error;
        }
    }

    /**
     * Delete rating
     */
    static async deleteUserRating(ratingId, userId) {
        try {
            logger.info("Deleting rating", { ratingId, userId });

            const db = require("../config/db");
            const ratingData = await db.query("SELECT * FROM ratings WHERE id = $1", [ratingId]);

            if (ratingData.rows.length === 0) {
                const error = new Error("Rating not found");
                error.statusCode = 404;
                throw error;
            }

            if (ratingData.rows[0].user_id !== userId) {
                const error = new Error("Unauthorized to delete this rating");
                error.statusCode = 403;
                throw error;
            }

            const deleted = await deleteRating(ratingId);
            logger.info("Rating deleted successfully", { ratingId, userId });
            return deleted;
        } catch (error) {
            logger.error("Failed to delete rating", { error: error.message, ratingId });
            throw error;
        }
    }
}

module.exports = RatingService;

