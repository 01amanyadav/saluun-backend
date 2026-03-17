const logger = require("../utils/logger");
const { getPaginationParams, buildPaginationMeta } = require("../utils/response");
const {
    createService,
    getServicesBySalon,
    getServiceById,
    updateService,
    deleteService
} = require("../models/serviceModel");
const { getSalonById } = require("../models/shopModel");

class ServiceManagementService {
    /**
     * Create new service
     */
    static async createNewService(salonId, ownerId, serviceData) {
        try {
            logger.info("Creating service", { salonId, ownerId });

            const salon = await getSalonById(salonId);
            if (!salon) {
                const error = new Error("Salon not found");
                error.statusCode = 404;
                throw error;
            }

            if (salon.owner_id !== ownerId) {
                const error = new Error("Unauthorized to add services to this salon");
                error.statusCode = 403;
                throw error;
            }

            const service = await createService(
                salonId,
                serviceData.name,
                serviceData.description,
                serviceData.price,
                serviceData.durationMinutes
            );

            logger.info("Service created successfully", { serviceId: service.id, salonId });
            return service;
        } catch (error) {
            logger.error("Failed to create service", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Get all services with pagination
     */
    static async getAllServicesWithPagination(page = 1, limit = 10) {
        try {
            const db = require("../config/db");
            
            // Get total count
            const countResult = await db.query(
                "SELECT COUNT(*) as total FROM services WHERE is_active = true"
            );
            const total = parseInt(countResult.rows[0].total);

            // Get paginated results
            const { offset } = getPaginationParams(page, limit);
            const result = await db.query(
                "SELECT s.*, sal.name as salon_name FROM services s INNER JOIN salons sal ON s.salon_id = sal.id WHERE s.is_active = true ORDER BY s.created_at DESC LIMIT $1 OFFSET $2",
                [limit, offset]
            );

            logger.info("Fetched all services with pagination", { page, limit, total });
            return {
                data: result.rows,
                pagination: buildPaginationMeta(total, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get all services", { error: error.message });
            throw error;
        }
    }

    /**
     * Get salon services with pagination
     */
    static async getSalonServicesWithPagination(salonId, page = 1, limit = 10) {
        try {
            const services = await getServicesBySalon(salonId);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = services.slice(offset, offset + limit);
            logger.info("Fetched salon services", { salonId, page, limit, total: services.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(services.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get salon services", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Get service details
     */
    static async getServiceDetails(serviceId) {
        try {
            const service = await getServiceById(serviceId);
            if (!service) {
                const error = new Error("Service not found");
                error.statusCode = 404;
                throw error;
            }

            logger.info("Fetched service details", { serviceId });
            return service;
        } catch (error) {
            logger.error("Failed to get service details", { error: error.message, serviceId });
            throw error;
        }
    }

    /**
     * Update service
     */
    static async updateServiceInfo(serviceId, ownerId, updates) {
        try {
            logger.info("Updating service", { serviceId, ownerId });

            const service = await getServiceById(serviceId);
            if (!service) {
                const error = new Error("Service not found");
                error.statusCode = 404;
                throw error;
            }

            const salon = await getSalonById(service.salon_id);
            if (salon.owner_id !== ownerId) {
                const error = new Error("Unauthorized to update this service");
                error.statusCode = 403;
                throw error;
            }

            const updated = await updateService(
                serviceId,
                updates.name,
                updates.description,
                updates.price,
                updates.durationMinutes
            );

            logger.info("Service updated successfully", { serviceId, ownerId });
            return updated;
        } catch (error) {
            logger.error("Failed to update service", { error: error.message, serviceId });
            throw error;
        }
    }

    /**
     * Delete service
     */
    static async deleteServiceInfo(serviceId, ownerId) {
        try {
            logger.info("Deleting service", { serviceId, ownerId });

            const service = await getServiceById(serviceId);
            if (!service) {
                const error = new Error("Service not found");
                error.statusCode = 404;
                throw error;
            }

            const salon = await getSalonById(service.salon_id);
            if (salon.owner_id !== ownerId) {
                const error = new Error("Unauthorized to delete this service");
                error.statusCode = 403;
                throw error;
            }

            const deleted = await deleteService(serviceId);
            logger.info("Service deleted successfully", { serviceId, ownerId });
            return deleted;
        } catch (error) {
            logger.error("Failed to delete service", { error: error.message, serviceId });
            throw error;
        }
    }
}

module.exports = ServiceManagementService;

