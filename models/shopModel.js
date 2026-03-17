const db = require("../config/db");

const createSalon = async (ownerId, name, location, description, phone, email, openingTime, closingTime) => {
    const result = await db.query(
        "INSERT INTO salons(owner_id, name, location, description, phone, email, opening_time, closing_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [ownerId, name, location, description, phone, email, openingTime, closingTime]
    );
    return result.rows[0];
};

const getAllSalons = async () => {
    const result = await db.query(
        "SELECT * FROM salons WHERE is_active = true ORDER BY rating DESC"
    );
    return result.rows;
};

const getSalonById = async (salonId) => {
    const result = await db.query(
        "SELECT * FROM salons WHERE id = $1 AND is_active = true",
        [salonId]
    );
    return result.rows[0];
};

const getSalonsByOwner = async (ownerId) => {
    const result = await db.query(
        "SELECT * FROM salons WHERE owner_id = $1 ORDER BY created_at DESC",
        [ownerId]
    );
    return result.rows;
};

const searchSalons = async (searchTerm) => {
    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(
        "SELECT * FROM salons WHERE is_active = true AND (name ILIKE $1 OR location ILIKE $1) ORDER BY rating DESC",
        [searchPattern]
    );
    return result.rows;
};

const filterSalons = async (filters) => {
    let query = "SELECT * FROM salons WHERE is_active = true";
    const params = [];
    let paramIndex = 1;

    if (filters.location) {
        query += ` AND location ILIKE $${paramIndex}`;
        params.push(`%${filters.location}%`);
        paramIndex++;
    }

    if (filters.minRating) {
        query += ` AND rating >= $${paramIndex}`;
        params.push(filters.minRating);
        paramIndex++;
    }

    if (filters.maxPrice) {
        query += ` AND id IN (
            SELECT DISTINCT salon_id FROM services WHERE price <= $${paramIndex}
        )`;
        params.push(filters.maxPrice);
        paramIndex++;
    }

    query += " ORDER BY rating DESC";

    const result = await db.query(query, params);
    return result.rows;
};

const updateSalon = async (salonId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name) {
        fields.push(`name = $${paramIndex}`);
        values.push(updates.name);
        paramIndex++;
    }
    if (updates.description) {
        fields.push(`description = $${paramIndex}`);
        values.push(updates.description);
        paramIndex++;
    }
    if (updates.location) {
        fields.push(`location = $${paramIndex}`);
        values.push(updates.location);
        paramIndex++;
    }
    if (updates.phone) {
        fields.push(`phone = $${paramIndex}`);
        values.push(updates.phone);
        paramIndex++;
    }
    if (updates.email) {
        fields.push(`email = $${paramIndex}`);
        values.push(updates.email);
        paramIndex++;
    }
    if (updates.openingTime) {
        fields.push(`opening_time = $${paramIndex}`);
        values.push(updates.openingTime);
        paramIndex++;
    }
    if (updates.closingTime) {
        fields.push(`closing_time = $${paramIndex}`);
        values.push(updates.closingTime);
        paramIndex++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(salonId);

    const query = `UPDATE salons SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
};

const deleteSalon = async (salonId) => {
    const result = await db.query(
        "UPDATE salons SET is_active = false WHERE id = $1 RETURNING *",
        [salonId]
    );
    return result.rows[0];
};

module.exports = {
    createSalon,
    getAllSalons,
    getSalonById,
    getSalonsByOwner,
    searchSalons,
    filterSalons,
    updateSalon,
    deleteSalon
};