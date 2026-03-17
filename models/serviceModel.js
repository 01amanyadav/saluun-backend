const db = require("../config/db");

const createService = async (salonId, name, description, price, durationMinutes) => {
    const result = await db.query(
        "INSERT INTO services(salon_id, name, description, price, duration_minutes) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [salonId, name, description, price, durationMinutes]
    );
    return result.rows[0];
};

const getServicesBySalon = async (salonId) => {
    const result = await db.query(
        "SELECT * FROM services WHERE salon_id = $1 AND is_active = true ORDER BY created_at DESC",
        [salonId]
    );
    return result.rows;
};

const getServiceById = async (serviceId) => {
    const result = await db.query(
        "SELECT * FROM services WHERE id = $1",
        [serviceId]
    );
    return result.rows[0];
};

const updateService = async (serviceId, name, description, price, durationMinutes) => {
    const result = await db.query(
        "UPDATE services SET name = $1, description = $2, price = $3, duration_minutes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
        [name, description, price, durationMinutes, serviceId]
    );
    return result.rows[0];
};

const deleteService = async (serviceId) => {
    const result = await db.query(
        "UPDATE services SET is_active = false WHERE id = $1 RETURNING *",
        [serviceId]
    );
    return result.rows[0];
};

module.exports = {
    createService,
    getServicesBySalon,
    getServiceById,
    updateService,
    deleteService
};
