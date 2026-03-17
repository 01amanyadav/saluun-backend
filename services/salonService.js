const logger = require("../utils/logger");
const { getPaginationParams, buildPaginationMeta } = require("../utils/response");
const {
    getAllSalons,
    getSalonById,
    getSalonsByOwner,
    searchSalons,
    filterSalons,
    createSalon,
    updateSalon,
    deleteSalon
} = require("../models/shopModel");

class SalonService {
    /**
     * Get all salons with pagination
     */
    static async getAllSalonsWithPagination(page = 1, limit = 10) {
        try {
            const { offset } = getPaginationParams(page, limit);
            const db = require("../config/db");

            // Get total count
            const countResult = await db.query(
                "SELECT COUNT(*) as total FROM salons WHERE is_active = true"
            );
            const total = parseInt(countResult.rows[0].total);

            // Get paginated results
            const result = await db.query(
                "SELECT * FROM salons WHERE is_active = true ORDER BY rating DESC LIMIT $1 OFFSET $2",
                [limit, offset]
            );

            logger.info("Fetched salons with pagination", { page, limit, total });
            return {
                data: result.rows,
                pagination: buildPaginationMeta(total, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get salons", { error: error.message });
            throw error;
        }
    }

    /**
     * Get single salon with all details
     */
    static async getSalonDetails(salonId) {
        try {
            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            // Get salon services
            const db = require("../config/db");
            const servicesResult = await db.query(
                "SELECT * FROM services WHERE salon_id = $1 AND is_active = true",
                [salonId]
            );

            logger.info("Fetched salon details", { salonId });
            return {
                ...salon,
                services: servicesResult.rows
            };
        } catch (error) {
            logger.error("Failed to get salon details", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Create new salon
     */
    static async createNewSalon(ownerId, salonData) {
        try {
            const salon = await createSalon(
                ownerId,
                salonData.name,
                salonData.location,
                salonData.description,
                salonData.phone,
                salonData.email,
                salonData.openingTime,
                salonData.closingTime
            );

            logger.info("Salon created successfully", { salonId: salon.id, ownerId });
            return salon;
        } catch (error) {
            logger.error("Failed to create salon", { error: error.message, ownerId });
            throw error;
        }
    }

    /**
     * Update salon details
     */
    static async updateSalonInfo(salonId, ownerId, updates) {
        try {
            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            if (salon.owner_id !== ownerId) {
                const error = new Error("Unauthorized to update this salon");
                error.statusCode = 403;
                throw error;
            }

            const updated = await updateSalon(salonId, updates);
            logger.info("Salon updated successfully", { salonId, ownerId });
            return updated;
        } catch (error) {
            logger.error("Failed to update salon", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Delete salon
     */
    static async removeSalon(salonId, ownerId) {
        try {
            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            if (salon.owner_id !== ownerId) {
                const error = new Error("Unauthorized to delete this salon");
                error.statusCode = 403;
                throw error;
            }

            const deleted = await deleteSalon(salonId);
            logger.info("Salon deleted successfully", { salonId, ownerId });
            return deleted;
        } catch (error) {
            logger.error("Failed to delete salon", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Search salons
     */
    static async searchSalonsWithPagination(searchTerm, page = 1, limit = 10) {
        try {
            const salons = await searchSalons(searchTerm);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = salons.slice(offset, offset + limit);
            logger.info("Searched salons", { searchTerm, page, limit, total: salons.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(salons.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to search salons", { error: error.message, searchTerm });
            throw error;
        }
    }

    /**
     * Filter salons
     */
    static async filterSalonsWithPagination(filters, page = 1, limit = 10) {
        try {
            const salons = await filterSalons(filters);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = salons.slice(offset, offset + limit);
            logger.info("Filtered salons", { filters, page, limit, total: salons.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(salons.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to filter salons", { error: error.message });
            throw error;
        }
    }

    /**
     * Get owner's salons
     */
    static async getOwnerSalonsWithPagination(ownerId, page = 1, limit = 10) {
        try {
            const salons = await getSalonsByOwner(ownerId);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = salons.slice(offset, offset + limit);
            logger.info("Fetched owner salons", { ownerId, page, limit, total: salons.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(salons.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get owner salons", { error: error.message, ownerId });
            throw error;
        }
    }
}

module.exports = SalonService;

