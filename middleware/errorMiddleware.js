const logger = require("../utils/logger");

/**
 * Custom Application Error class for structured error handling
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handling middleware
 * Catches and processes all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // Log error with appropriate level
    if (err.statusCode >= 500) {
        logger.error("Server Error", {
            message: err.message,
            status: err.statusCode,
            path: req.path,
            method: req.method,
            userId: req.user?.id,
            stack: err.stack
        });
    } else {
        logger.warn("Client Error", {
            message: err.message,
            status: err.statusCode,
            path: req.path,
            method: req.method,
            userId: req.user?.id
        });
    }

    // Handle known errors
    if (err.statusCode === 400) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: err.message || "Invalid request parameters",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack })
        });
    }

    if (err.statusCode === 401) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: err.message || "Authentication required"
        });
    }

    if (err.statusCode === 403) {
        return res.status(403).json({
            success: false,
            statusCode: 403,
            error: "Forbidden",
            message: err.message || "You do not have permission to access this resource"
        });
    }

    if (err.statusCode === 404) {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: err.message || "The requested resource was not found"
        });
    }

    if (err.statusCode === 409) {
        return res.status(409).json({
            success: false,
            statusCode: 409,
            error: "Conflict",
            message: err.message || "Resource already exists"
        });
    }

    if (err.statusCode === 422) {
        return res.status(422).json({
            success: false,
            statusCode: 422,
            error: "Unprocessable Entity",
            message: err.message || "Validation failed",
            details: err.details || null
        });
    }

    // Handle Joi validation errors
    if (err.details && Array.isArray(err.details)) {
        return res.status(422).json({
            success: false,
            statusCode: 422,
            error: "Validation Error",
            message: "Request validation failed",
            details: err.details.map(detail => ({
                field: detail.path.join("."),
                message: detail.message,
                type: detail.type
            }))
        });
    }

    // Handle database errors
    if (err.code === "23505") { // Unique violation
        return res.status(409).json({
            success: false,
            statusCode: 409,
            error: "Conflict",
            message: "Duplicate entry: This record already exists"
        });
    }

    if (err.code === "23503") { // Foreign key violation
        return res.status(400).json({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "Invalid reference: The referenced resource does not exist"
        });
    }

    // Default server error
    res.status(500).json({
        success: false,
        statusCode: 500,
        error: "Internal Server Error",
        message: err.message || "An unexpected error occurred",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

/**
 * Async route handler wrapper to catch promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };