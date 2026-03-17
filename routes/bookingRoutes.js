const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateRequest");
const { bookingSchema, rescheduleBookingSchema } = require("../validations/schemas");

const {
   bookService,
   myBookings,
   getBooking,
   cancelUserBooking,
   rescheduleUserBooking,
   getSalonAllBookings,
   getSalonBookingsByDate,
   completeBooking
} = require("../controllers/bookingController");

// Get user's bookings
router.get("/my-bookings", authMiddleware, myBookings);

// Get specific booking
router.get("/:bookingId", authMiddleware, getBooking);

// Book a service
router.post("/", authMiddleware, validate(bookingSchema), bookService);

// Cancel booking
router.put("/:bookingId/cancel", authMiddleware, cancelUserBooking);

// Reschedule booking
router.put("/:bookingId/reschedule", authMiddleware, validate(rescheduleBookingSchema), rescheduleUserBooking);

// Salon owner routes
router.get("/salon/:salonId/all", authMiddleware, getSalonAllBookings);
router.get("/salon/:salonId/date", authMiddleware, getSalonBookingsByDate);
router.put("/:bookingId/complete", authMiddleware, completeBooking);

module.exports = router;