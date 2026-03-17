const db = require("../config/db");

const createTimeSlot = async (salonId, date, time) => {
    const result = await db.query(
        "INSERT INTO time_slots(salon_id, date, time) VALUES($1, $2, $3) RETURNING *",
        [salonId, date, time]
    );
    return result.rows[0];
};

const getAvailableSlots = async (salonId, date) => {
    const result = await db.query(
        "SELECT * FROM time_slots WHERE salon_id = $1 AND date = $2 AND is_available = true ORDER BY time ASC",
        [salonId, date]
    );
    return result.rows;
};

const getAllSlots = async (salonId, date) => {
    const result = await db.query(
        "SELECT * FROM time_slots WHERE salon_id = $1 AND date = $2 ORDER BY time ASC",
        [salonId, date]
    );
    return result.rows;
};

const markSlotAsUnavailable = async (salonId, date, time) => {
    const result = await db.query(
        "UPDATE time_slots SET is_available = false WHERE salon_id = $1 AND date = $2 AND time = $3 RETURNING *",
        [salonId, date, time]
    );
    return result.rows[0];
};

const markSlotAsAvailable = async (salonId, date, time) => {
    const result = await db.query(
        "UPDATE time_slots SET is_available = true WHERE salon_id = $1 AND date = $2 AND time = $3 RETURNING *",
        [salonId, date, time]
    );
    return result.rows[0];
};

const deleteTimeSlot = async (slotId) => {
    const result = await db.query(
        "DELETE FROM time_slots WHERE id = $1 RETURNING *",
        [slotId]
    );
    return result.rows[0];
};

const bulkCreateTimeSlots = async (salonId, date, times) => {
    const values = times.map((time, index) => `($1, $2, $${index + 3})`).join(',');
    const params = [salonId, date, ...times];
    
    const result = await db.query(
        `INSERT INTO time_slots(salon_id, date, time) VALUES ${values} RETURNING *`,
        params
    );
    return result.rows;
};

module.exports = {
    createTimeSlot,
    getAvailableSlots,
    getAllSlots,
    markSlotAsUnavailable,
    markSlotAsAvailable,
    deleteTimeSlot,
    bulkCreateTimeSlots
};
