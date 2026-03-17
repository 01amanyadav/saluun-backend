const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const BookingService = require("../services/bookingService");


const bookService = asyncHandler(async (req, res) => {
   const userId = req.user.id;
   const { salonId, serviceId, date, time } = req.body;

   const booking = await BookingService.createBookingWithTransaction(
      userId,
      salonId,
      serviceId,
      date,
      time
   );

   res.status(201).json(
      formatSuccessResponse(
         booking,
         "Booking created successfully"
      )
   );
});


const myBookings = asyncHandler(async (req, res) => {
   const userId = req.user.id;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;

   const result = await BookingService.getUserBookingsWithPagination(userId, page, limit);
   res.json(formatSuccessResponse(result, "User bookings fetched"));
});


const getBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const userId = req.user.id;

   const booking = await BookingService.getBookingDetails(bookingId, userId);
   res.json(formatSuccessResponse(booking, "Booking details fetched"));
});


const cancelUserBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const userId = req.user.id;

   const cancelledBooking = await BookingService.cancelBookingWithTransaction(bookingId, userId);
   res.json(formatSuccessResponse(cancelledBooking, "Booking cancelled successfully"));
});


const rescheduleUserBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;
   const { newDate, newTime, reason } = req.body;
   const userId = req.user.id;

   const rescheduledBooking = await BookingService.rescheduleBookingWithTransaction(
      bookingId,
      userId,
      newDate,
      newTime,
      reason
   );

   res.json(formatSuccessResponse(rescheduledBooking, "Booking rescheduled successfully"));
});


const getSalonAllBookings = asyncHandler(async (req, res) => {
   const salonId = req.params.salonId;
   const ownerId = req.user.id;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;

   const result = await BookingService.getSalonBookingsWithPagination(
      salonId,
      ownerId,
      page,
      limit
   );

   res.json(formatSuccessResponse(result, "Salon bookings fetched"));
});


const getSalonBookingsByDate = asyncHandler(async (req, res) => {
   const { salonId } = req.params;
   const { date } = req.query;
   const ownerId = req.user.id;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;

   const result = await BookingService.getSalonBookingsByDateWithPagination(
      salonId,
      date,
      ownerId,
      page,
      limit
   );

   res.json(formatSuccessResponse(result, "Salon bookings by date fetched"));
});


const completeBooking = asyncHandler(async (req, res) => {
   const { bookingId } = req.params;

   const completedBooking = await BookingService.completeBooking(bookingId);
   res.json(formatSuccessResponse(completedBooking, "Booking marked as completed"));
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