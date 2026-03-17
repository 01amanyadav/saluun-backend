const logger = require("../utils/logger");
const { getPaginationParams, buildPaginationMeta } = require("../utils/response");
const { executeQuery } = require("../utils/database");
const db = require("../config/db");

class OwnerAnalyticsService {
    /**
     * Get owner dashboard with key metrics
     */
    static async getOwnerDashboard(ownerId) {
        try {
            logger.info("Fetching owner dashboard", { ownerId });

            const salonsQuery = `
                SELECT COUNT(*) as total_salons 
                FROM salons 
                WHERE owner_id = $1 AND is_active = true
            `;
            const salonsResult = await executeQuery(salonsQuery, [ownerId], "Get owner salons count");

            const bookingsQuery = `
                SELECT COUNT(*) as total_bookings
                FROM bookings b
                INNER JOIN salons s ON b.salon_id = s.id
                WHERE s.owner_id = $1
            `;
            const bookingsResult = await executeQuery(bookingsQuery, [ownerId], "Get owner bookings count");

            const revenueQuery = `
                SELECT COALESCE(SUM(s.price), 0) as total_revenue
                FROM bookings b
                INNER JOIN salons sal ON b.salon_id = sal.id
                INNER JOIN services s ON b.service_id = s.id
                WHERE sal.owner_id = $1 AND b.status = 'completed'
            `;
            const revenueResult = await executeQuery(revenueQuery, [ownerId], "Calculate revenue");

            const ratingQuery = `
                SELECT COALESCE(AVG(r.rating), 0) as avg_rating
                FROM ratings r
                INNER JOIN salons s ON r.salon_id = s.id
                WHERE s.owner_id = $1
            `;
            const ratingResult = await executeQuery(ratingQuery, [ownerId], "Get average rating");

            logger.info("Owner dashboard fetched successfully", { ownerId });

            return {
                ownerId,
                metrics: {
                    totalSalons: parseInt(salonsResult.rows[0].total_salons) || 0,
                    totalBookings: parseInt(bookingsResult.rows[0].total_bookings) || 0,
                    totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
                    averageRating: parseFloat(ratingResult.rows[0].avg_rating) || 0
                }
            };
        } catch (error) {
            logger.error("Failed to get owner dashboard", { error: error.message, ownerId });
            throw error;
        }
    }

    /**
     * Get individual salon analytics
     */
    static async getSalonAnalytics(salonId, ownerId) {
        try {
            logger.info("Fetching salon analytics", { salonId, ownerId });

            // Verify ownership
            const ownershipQuery = `
                SELECT id FROM salons
                WHERE id = $1 AND owner_id = $2
            `;
            const ownershipResult = await executeQuery(ownershipQuery, [salonId, ownerId], "Verify salon ownership");

            if (ownershipResult.rows.length === 0) {
                const error = new Error("Unauthorized: Salon not owned by this user");
                error.statusCode = 403;
                throw error;
            }

            const salonQuery = `
                SELECT * FROM salons WHERE id = $1
            `;
            const salonResult = await executeQuery(salonQuery, [salonId], "Get salon details");

            if (salonResult.rows.length === 0) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            const bookingsQuery = `
                SELECT COUNT(*) as total_bookings
                FROM bookings
                WHERE salon_id = $1
            `;
            const bookingsResult = await executeQuery(bookingsQuery, [salonId], "Get salon bookings");

            const completedQuery = `
                SELECT COUNT(*) as completed_bookings
                FROM bookings
                WHERE salon_id = $1 AND status = 'completed'
            `;
            const completedResult = await executeQuery(completedQuery, [salonId], "Get completed bookings");

            const cancelledQuery = `
                SELECT COUNT(*) as cancelled_bookings
                FROM bookings
                WHERE salon_id = $1 AND status = 'cancelled'
            `;
            const cancelledResult = await executeQuery(cancelledQuery, [salonId], "Get cancelled bookings");

            const ratingQuery = `
                SELECT 
                    COALESCE(AVG(rating), 0) as avg_rating,
                    COUNT(*) as total_ratings
                FROM ratings
                WHERE salon_id = $1
            `;
            const ratingResult = await executeQuery(ratingQuery, [salonId], "Get salon ratings");

            logger.info("Salon analytics fetched successfully", { salonId, ownerId });

            return {
                salonId,
                salonName: salonResult.rows[0].name,
                analytics: {
                    totalBookings: parseInt(bookingsResult.rows[0].total_bookings) || 0,
                    completedBookings: parseInt(completedResult.rows[0].completed_bookings) || 0,
                    cancelledBookings: parseInt(cancelledResult.rows[0].cancelled_bookings) || 0,
                    averageRating: parseFloat(ratingResult.rows[0].avg_rating) || 0,
                    totalRatings: parseInt(ratingResult.rows[0].total_ratings) || 0
                }
            };
        } catch (error) {
            logger.error("Failed to get salon analytics", { error: error.message, salonId, ownerId });
            throw error;
        }
    }

    /**
     * Get booking statistics with pagination
     */
    static async getBookingStatsWithPagination(ownerId, filters = {}, page = 1, limit = 10) {
        try {
            logger.info("Fetching booking stats", { ownerId, page, limit });

            let query = `
                SELECT 
                    b.id, b.user_id, b.salon_id, b.service_id, b.booking_date, 
                    b.time_slot, b.status, b.created_at,
                    sal.name as salon_name,
                    srv.name as service_name,
                    srv.price as service_price
                FROM bookings b
                INNER JOIN salons sal ON b.salon_id = sal.id
                INNER JOIN services srv ON b.service_id = srv.id
                WHERE sal.owner_id = $1
            `;

            let params = [ownerId];
            let paramIndex = 2;

            // Apply filters
            if (filters.status) {
                query += ` AND b.status = $${paramIndex}`;
                params.push(filters.status);
                paramIndex++;
            }

            if (filters.salonId) {
                query += ` AND b.salon_id = $${paramIndex}`;
                params.push(filters.salonId);
                paramIndex++;
            }

            if (filters.startDate) {
                query += ` AND b.booking_date >= $${paramIndex}`;
                params.push(filters.startDate);
                paramIndex++;
            }

            if (filters.endDate) {
                query += ` AND b.booking_date <= $${paramIndex}`;
                params.push(filters.endDate);
                paramIndex++;
            }

            const totalResult = await executeQuery(query, params, "Get total booking stats count");
            const { offset } = getPaginationParams(page, limit);

            query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await executeQuery(query, params, "Get paginated booking stats");

            logger.info("Booking stats fetched successfully", { ownerId, total: totalResult.rows.length });

            return {
                data: result.rows,
                pagination: buildPaginationMeta(totalResult.rows.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get booking stats", { error: error.message, ownerId });
            throw error;
        }
    }

    /**
     * Calculate revenue for owner
     */
    static async calculateOwnerRevenue(ownerId, filters = {}) {
        try {
            logger.info("Calculating owner revenue", { ownerId });

            let query = `
                SELECT 
                    COALESCE(SUM(s.price), 0) as total_revenue,
                    COUNT(b.id) as completed_bookings
                FROM bookings b
                INNER JOIN salons sal ON b.salon_id = sal.id
                INNER JOIN services s ON b.service_id = s.id
                WHERE sal.owner_id = $1 AND b.status = 'completed'
            `;

            let params = [ownerId];
            let paramIndex = 2;

            if (filters.startDate) {
                query += ` AND b.booking_date >= $${paramIndex}`;
                params.push(filters.startDate);
                paramIndex++;
            }

            if (filters.endDate) {
                query += ` AND b.booking_date <= $${paramIndex}`;
                params.push(filters.endDate);
                paramIndex++;
            }

            const result = await executeQuery(query, params, "Calculate revenue");

            logger.info("Revenue calculated successfully", { ownerId });

            return {
                ownerId,
                totalRevenue: parseFloat(result.rows[0].total_revenue) || 0,
                completedBookings: parseInt(result.rows[0].completed_bookings) || 0,
                period: filters.startDate && filters.endDate 
                    ? `${filters.startDate} to ${filters.endDate}`
                    : "All time"
            };
        } catch (error) {
            logger.error("Failed to calculate revenue", { error: error.message, ownerId });
            throw error;
        }
    }

    /**
     * Get salon list for owner with analytics
     */
    static async getOwnerSalonsWithAnalytics(ownerId, page = 1, limit = 10) {
        try {
            logger.info("Fetching owner salons with analytics", { ownerId, page, limit });

            const query = `
                SELECT 
                    s.id, s.name, s.location, s.created_at,
                    COUNT(DISTINCT b.id) as total_bookings,
                    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
                    COALESCE(AVG(r.rating), 0) as avg_rating
                FROM salons s
                LEFT JOIN bookings b ON s.id = b.salon_id
                LEFT JOIN ratings r ON s.id = r.salon_id
                WHERE s.owner_id = $1 AND s.is_active = true
                GROUP BY s.id, s.name, s.location, s.created_at
                ORDER BY s.created_at DESC
                LIMIT $2 OFFSET $3
            `;

            const { offset } = getPaginationParams(page, limit);
            const result = await executeQuery(query, [ownerId, limit, offset], "Get owner salons with analytics");

            const countQuery = `
                SELECT COUNT(*) FROM salons
                WHERE owner_id = $1 AND is_active = true
            `;
            const countResult = await executeQuery(countQuery, [ownerId], "Count owner salons");

            logger.info("Owner salons with analytics fetched successfully", { ownerId, count: result.rows.length });

            return {
                data: result.rows,
                pagination: buildPaginationMeta(parseInt(countResult.rows[0].count), page, limit)
            };
        } catch (error) {
            logger.error("Failed to get owner salons", { error: error.message, ownerId });
            throw error;
        }
    }
}

module.exports = OwnerAnalyticsService;

