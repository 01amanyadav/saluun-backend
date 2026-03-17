const db = require("../config/db");

const recordReschedule = async (bookingId, oldDate, oldTime, newDate, newTime, reason) => {
    const result = await db.query(
        "INSERT INTO reschedule_history(booking_id, old_date, old_time, new_date, new_time, reason) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        [bookingId, oldDate, oldTime, newDate, newTime, reason]
    );
    return result.rows[0];
};

const getRescheduleHistory = async (bookingId) => {
    const result = await db.query(
        "SELECT * FROM reschedule_history WHERE booking_id = $1 ORDER BY created_at DESC",
        [bookingId]
    );
    return result.rows;
};

const getRescheduleHistoryBySalon = async (salonId) => {
    const result = await db.query(
        `SELECT rh.* FROM reschedule_history rh
         JOIN bookings b ON rh.booking_id = b.id
         WHERE b.salon_id = $1
         ORDER BY rh.created_at DESC`,
        [salonId]
    );
    return result.rows;
};

module.exports = {
    recordReschedule,
    getRescheduleHistory,
    getRescheduleHistoryBySalon
};
