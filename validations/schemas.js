const Joi = require("joi");

// Auth Validation Schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters"
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required"
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required"
    }),
    phone: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required"
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required"
    })
});

// Salon Validation Schemas
const createSalonSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Salon name is required",
        "string.min": "Name must be at least 2 characters"
    }),
    location: Joi.string().min(5).max(255).required().messages({
        "string.empty": "Location is required",
        "string.min": "Location must be at least 5 characters"
    }),
    description: Joi.string().max(500).optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    openingTime: Joi.string().pattern(/^\d{2}:\d{2}:\d{2}$/).optional(),
    closingTime: Joi.string().pattern(/^\d{2}:\d{2}:\d{2}$/).optional()
});

const updateSalonSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    location: Joi.string().min(5).max(255).optional(),
    description: Joi.string().max(500).optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    openingTime: Joi.string().pattern(/^\d{2}:\d{2}:\d{2}$/).optional(),
    closingTime: Joi.string().pattern(/^\d{2}:\d{2}:\d{2}$/).optional()
});

// Service Validation Schemas
const createServiceSchema = Joi.object({
    salonId: Joi.number().integer().required().messages({
        "number.base": "Salon ID must be a number",
        "any.required": "Salon ID is required"
    }),
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Service name is required"
    }),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().required().messages({
        "number.positive": "Price must be a positive number",
        "any.required": "Price is required"
    }),
    durationMinutes: Joi.number().integer().min(5).max(480).required().messages({
        "number.integer": "Duration must be in minutes",
        "number.min": "Duration must be at least 5 minutes",
        "any.required": "Duration is required"
    })
});

const updateServiceSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().optional(),
    durationMinutes: Joi.number().integer().min(5).max(480).optional()
});

// Booking Validation Schemas
const bookingSchema = Joi.object({
    salonId: Joi.number().integer().required().messages({
        "number.base": "Salon ID must be a number",
        "any.required": "Salon ID is required"
    }),
    serviceId: Joi.number().integer().required().messages({
        "number.base": "Service ID must be a number",
        "any.required": "Service ID is required"
    }),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        "string.pattern.base": "Date must be in YYYY-MM-DD format",
        "any.required": "Date is required"
    }),
    time: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
        "string.pattern.base": "Time must be in HH:MM format",
        "any.required": "Time is required"
    })
});

const rescheduleBookingSchema = Joi.object({
    newDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        "string.pattern.base": "Date must be in YYYY-MM-DD format",
        "any.required": "New date is required"
    }),
    newTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
        "string.pattern.base": "Time must be in HH:MM format",
        "any.required": "New time is required"
    }),
    reason: Joi.string().max(255).optional()
});

// Rating Validation Schemas
const ratingSchema = Joi.object({
    salonId: Joi.number().integer().required().messages({
        "number.base": "Salon ID must be a number",
        "any.required": "Salon ID is required"
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Rating must be between 1 and 5",
        "number.max": "Rating must be between 1 and 5",
        "any.required": "Rating is required"
    }),
    review: Joi.string().max(1000).optional(),
    bookingId: Joi.number().integer().optional()
});

const updateRatingSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Rating must be between 1 and 5",
        "number.max": "Rating must be between 1 and 5"
    }),
    review: Joi.string().max(1000).optional()
});

module.exports = {
    registerSchema,
    loginSchema,
    createSalonSchema,
    updateSalonSchema,
    createServiceSchema,
    updateServiceSchema,
    bookingSchema,
    rescheduleBookingSchema,
    ratingSchema,
    updateRatingSchema
};
