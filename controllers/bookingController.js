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
const { recordReschedule, getRescheduleHistory } = require("../models/rescheduleModel");
const { updateSalonAnalytics } = require("../models/analyticsModel");
const asyncHandler = require("../utils/asyncHandler");

const bookService = asyncHandler(async (req, res) => {
   const userId = req.user.id;
   const { salonId, serviceId, date, time } = req.body;

   if (!salonId || !serviceId || !date || !time) {
      const error = new Error("Salon ID, service ID, date, and time are required");
      error.status = 400;
      throw error;
   }

   const slotTaken = await checkSlot(salonId, date, time);

   if (slotTaken) {
      const error = new Error("Time slot already booked");
      error.status = 400;
      throw error;
   }

   const booking = await createBooking(userId, salonId, serviceId, date, time);

   res.status(201).json({
      message: "Booking created successfully",
      booking: booking
   });
});

const myBookings = asyncHandler(async (req, res) => {
   const userId = req.user.id;
   const bookings = await getUserBookings(userId);
   res.json(bookings);
});

const getBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const booking = await getBookingById(bookingId);

   if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
   }

   res.json(booking);
});

const cancelUserBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const userId = req.user.id;

   const booking = await getBookingById(bookingId);

   if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
   }

   if (booking.user_id !== userId && req.user.role !== "admin") {
      const error = new Error("Unauthorized to cancel this booking");
      error.status = 403;
      throw error;
   }

   const cancelledBooking = await cancelBooking(bookingId);
   await updateSalonAnalytics(booking.salon_id);

   res.json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking
   });
});

const rescheduleUserBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const { newDate, newTime } = req.body;
   const userId = req.user.id;

   if (!newDate || !newTime) {
      const error = new Error("New date and time are required");
      error.status = 400;
      throw error;
   }

   const booking = await getBookingById(bookingId);

   if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
   }

   if (booking.user_id !== userId && req.user.role !== "admin") {
      const error = new Error("Unauthorized to reschedule this booking");
      error.status = 403;
      throw error;
   }

   // Check if new slot is available
   const slotTaken = await checkSlot(booking.salon_id, newDate, newTime);
   if (slotTaken) {
      const error = new Error("New time slot is not available");
      error.status = 400;
      throw error;
   }

   // Record reschedule history
   await recordReschedule(bookingId, booking.date, booking.time, newDate, newTime, req.body.reason);

   const rescheduledBooking = await rescheduleBooking(bookingId, newDate, newTime);
   res.json({
      message: "Booking rescheduled successfully",
      booking: rescheduledBooking
   });
});

const getSalonAllBookings = asyncHandler(async (req, res) => {
   const salonId = req.params.salonId;
   const bookings = await getSalonBookings(salonId);
   res.json(bookings);
});

const getSalonBookingsByDate = asyncHandler(async (req, res) => {
   const { salonId } = req.params;
   const { date } = req.query;

   if (!date) {
      const error = new Error("Date query parameter is required");
      error.status = 400;
      throw error;
   }

   const bookings = await getBookingsByDate(salonId, date);
   res.json(bookings);
});

const completeBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;

   const booking = await getBookingById(bookingId);

   if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
   }

   const completedBooking = await updateBookingStatus(bookingId, "completed");
   await updateSalonAnalytics(booking.salon_id);

   res.json({
      message: "Booking marked as completed",
      booking: completedBooking
   });
});

module.exports = {
   bookService,
   myBookings,
   getBooking,
   cancelUserBooking,
   rescheduleUserBooking,
   getSalonAllBookings,
   getSalonBookingsByDate,
   completeBooking
};