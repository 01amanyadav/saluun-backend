const logger = require("../utils/logger");
const { executeTransaction } = require("../utils/database");
const { getPaginationParams, buildPaginationMeta } = require("../utils/response");
const {
    createBooking,
    getUserBookings,
    checkSlot,
    getBookingById,
    getSalonBookings,
    cancelBooking,
    rescheduleBooking,
    updateBookingStatus,
    getBookingsByDate
} = require("../models/Booking");

class BookingService {
    /**
     * Create a booking with transaction
     */
    static async createBookingWithTransaction(userId, salonId, serviceId, date, time) {
        try {
            logger.info("Creating booking", { userId, salonId, serviceId, date, time });

            return await executeTransaction(async (client) => {
                // Check slot availability
                const existingBooking = await checkSlot(salonId, date, time);
                if (existingBooking) {
                    const error = new Error("Time slot already booked");
                    error.statusCode = 400;
                    throw error;
                }

                // Create booking
                const booking = await createBooking(userId, salonId, serviceId, date, time);

                logger.info("Booking created successfully", { bookingId: booking.id, userId });
                return booking;
            });
        } catch (error) {
            logger.error("Failed to create booking", { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Get user bookings with pagination
     */
    static async getUserBookingsWithPagination(userId, page = 1, limit = 10) {
        try {
            const bookings = await getUserBookings(userId);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = bookings.slice(offset, offset + limit);
            logger.info("Fetched user bookings", { userId, page, limit, total: bookings.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(bookings.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get user bookings", { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Get booking details
     */
    static async getBookingDetails(bookingId, userId) {
        try {
            const booking = await getBookingById(bookingId);
            if (!booking) {
                const error = new Error("Booking not found");
                error.statusCode = 404;
                throw error;
            }

            if (booking.user_id !== userId) {
                const error = new Error("Unauthorized to view this booking");
                error.statusCode = 403;
                throw error;
            }

            logger.info("Fetched booking details", { bookingId, userId });
            return booking;
        } catch (error) {
            logger.error("Failed to get booking details", { error: error.message, bookingId });
            throw error;
        }
    }

    /**
     * Cancel booking with transaction
     */
    static async cancelBookingWithTransaction(bookingId, userId) {
        try {
            logger.info("Cancelling booking", { bookingId, userId });

            return await executeTransaction(async (client) => {
                const booking = await getBookingById(bookingId);
                if (!booking) {
                    const error = new Error("Booking not found");
                    error.statusCode = 404;
                    throw error;
                }

                if (booking.user_id !== userId) {
                    const error = new Error("Unauthorized to cancel this booking");
                    error.statusCode = 403;
                    throw error;
                }

                const cancelled = await cancelBooking(bookingId);
                logger.info("Booking cancelled successfully", { bookingId, userId });
                return cancelled;
            });
        } catch (error) {
            logger.error("Failed to cancel booking", { error: error.message, bookingId });
            throw error;
        }
    }

    /**
     * Reschedule booking with transaction
     */
    static async rescheduleBookingWithTransaction(bookingId, userId, newDate, newTime, reason) {
        try {
            logger.info("Rescheduling booking", { bookingId, userId, newDate, newTime });

            return await executeTransaction(async (client) => {
                const booking = await getBookingById(bookingId);
                if (!booking) {
                    const error = new Error("Booking not found");
                    error.statusCode = 404;
                    throw error;
                }

                if (booking.user_id !== userId) {
                    const error = new Error("Unauthorized to reschedule this booking");
                    error.statusCode = 403;
                    throw error;
                }

                // Check new slot availability
                const conflictingBooking = await checkSlot(booking.salon_id, newDate, newTime);
                if (conflictingBooking) {
                    const error = new Error("New time slot is not available");
                    error.statusCode = 400;
                    throw error;
                }

                // Record reschedule history
                const { recordReschedule } = require("../models/rescheduleModel");
                await recordReschedule(bookingId, booking.date, booking.time, newDate, newTime, reason);

                // Update booking
                const rescheduled = await rescheduleBooking(bookingId, newDate, newTime);

                logger.info("Booking rescheduled successfully", { bookingId, userId, newDate, newTime });
                return rescheduled;
            });
        } catch (error) {
            logger.error("Failed to reschedule booking", { error: error.message, bookingId });
            throw error;
        }
    }

    /**
     * Get salon bookings with pagination
     */
    static async getSalonBookingsWithPagination(salonId, ownerId, page = 1, limit = 10) {
        try {
            const bookings = await getSalonBookings(salonId);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = bookings.slice(offset, offset + limit);
            logger.info("Fetched salon bookings", { salonId, page, limit, total: bookings.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(bookings.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get salon bookings", { error: error.message, salonId });
            throw error;
        }
    }

    /**
     * Get salon bookings by date with pagination
     */
    static async getSalonBookingsByDateWithPagination(salonId, date, ownerId, page = 1, limit = 10) {
        try {
            const bookings = await getBookingsByDate(salonId, date);
            const { offset } = getPaginationParams(page, limit);

            const paginatedResults = bookings.slice(offset, offset + limit);
            logger.info("Fetched salon bookings by date", { salonId, date, page, limit, total: bookings.length });

            return {
                data: paginatedResults,
                pagination: buildPaginationMeta(bookings.length, page, limit)
            };
        } catch (error) {
            logger.error("Failed to get salon bookings by date", { error: error.message, salonId, date });
            throw error;
        }
    }

    /**
     * Mark booking as completed
     */
    static async completeBooking(bookingId) {
        try {
            const booking = await getBookingById(bookingId);
            if (!booking) {
                const error = new Error("Booking not found");
                error.statusCode = 404;
                throw error;
            }

            const completed = await updateBookingStatus(bookingId, "completed");
            logger.info("Booking marked as completed", { bookingId });
            return completed;
        } catch (error) {
            logger.error("Failed to complete booking", { error: error.message, bookingId });
            throw error;
        }
    }
}

module.exports = BookingService;

