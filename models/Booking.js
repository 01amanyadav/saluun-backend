const db = require("../config/db");

const createBooking = async (userId, salonId, serviceId, date, time) => {
    const result = await db.query(
        "INSERT INTO bookings(user_id, salon_id, service_id, date, time) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [userId, salonId, serviceId, date, time]
    );
    return result.rows[0];
};

const getUserBookings = async (userId) => {
    const result = await db.query(
        `SELECT bookings.id, bookings.status, salons.name as salon_name, services.name as service_name, 
                services.price, bookings.date, bookings.time, bookings.created_at
         FROM bookings
         JOIN salons ON bookings.salon_id = salons.id
         JOIN services ON bookings.service_id = services.id
         WHERE bookings.user_id = $1
         ORDER BY bookings.date DESC`,
        [userId]
    );
    return result.rows;
};

const getBookingById = async (bookingId) => {
    const result = await db.query(
        `SELECT bookings.*, salons.name as salon_name, services.name as service_name, services.price
         FROM bookings
         JOIN salons ON bookings.salon_id = salons.id
         JOIN services ON bookings.service_id = services.id
         WHERE bookings.id = $1`,
        [bookingId]
    );
    return result.rows[0];
};

const checkSlot = async (salonId, date, time) => {
    const result = await db.query(
        "SELECT * FROM bookings WHERE salon_id = $1 AND date = $2 AND time = $3 AND status != 'cancelled'",
        [salonId, date, time]
    );
    return result.rows[0];
};

const getSalonBookings = async (salonId) => {
    const result = await db.query(
        `SELECT bookings.*, users.name as user_name, users.email, users.phone, 
                services.name as service_name, services.price
         FROM bookings
         JOIN users ON bookings.user_id = users.id
         JOIN services ON bookings.service_id = services.id
         WHERE bookings.salon_id = $1
         ORDER BY bookings.date DESC`,
        [salonId]
    );
    return result.rows;
};

const cancelBooking = async (bookingId) => {
    const result = await db.query(
        "UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [bookingId]
    );
    return result.rows[0];
};

const rescheduleBooking = async (bookingId, newDate, newTime) => {
    // Get old booking details
    const oldBooking = await getBookingById(bookingId);
    
    // Update booking
    const result = await db.query(
        "UPDATE bookings SET date = $1, time = $2, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [newDate, newTime, bookingId]
    );
    
    return result.rows[0];
};

const updateBookingStatus = async (bookingId, status) => {
    const result = await db.query(
        "UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [status, bookingId]
    );
    return result.rows[0];
};

const getBookingsByDate = async (salonId, date) => {
    const result = await db.query(
        `SELECT bookings.*, users.name as user_name, services.name as service_name
         FROM bookings
         JOIN users ON bookings.user_id = users.id
         JOIN services ON bookings.service_id = services.id
         WHERE bookings.salon_id = $1 AND bookings.date = $2 AND bookings.status != 'cancelled'
         ORDER BY bookings.time`,
        [salonId, date]
    );
    return result.rows;
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    checkSlot,
    getSalonBookings,
    cancelBooking,
    rescheduleBooking,
    updateBookingStatus,
    getBookingsByDate
};