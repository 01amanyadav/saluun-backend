const db = require("../config/db");

const createRating = async (userId, salonId, rating, review, bookingId = null) => {
    const result = await db.query(
        "INSERT INTO ratings(user_id, salon_id, rating, review, booking_id) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [userId, salonId, rating, review, bookingId]
    );
    
    // Update salon's overall rating
    await updateSalonRating(salonId);
    
    return result.rows[0];
};

const getRatingsBySalon = async (salonId) => {
    const result = await db.query(
        `SELECT r.*, u.name, u.email 
         FROM ratings r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.salon_id = $1 
         ORDER BY r.created_at DESC`,
        [salonId]
    );
    return result.rows;
};

const getSalonRating = async (salonId) => {
    const result = await db.query(
        "SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE salon_id = $1",
        [salonId]
    );
    return result.rows[0];
};

const updateSalonRating = async (salonId) => {
    const ratingData = await getSalonRating(salonId);
    const avgRating = ratingData.average_rating ? parseFloat(ratingData.average_rating).toFixed(1) : 0;
    const totalRatings = ratingData.total_ratings || 0;
    
    await db.query(
        "UPDATE salons SET rating = $1, total_ratings = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [avgRating, totalRatings, salonId]
    );
};

const checkUserRating = async (userId, salonId) => {
    const result = await db.query(
        "SELECT * FROM ratings WHERE user_id = $1 AND salon_id = $2",
        [userId, salonId]
    );
    return result.rows[0];
};

const updateRating = async (ratingId, rating, review) => {
    const result = await db.query(
        "UPDATE ratings SET rating = $1, review = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [rating, review, ratingId]
    );
    
    if (result.rows.length > 0) {
        await updateSalonRating(result.rows[0].salon_id);
    }
    
    return result.rows[0];
};

const deleteRating = async (ratingId) => {
    const rating = await db.query("SELECT salon_id FROM ratings WHERE id = $1", [ratingId]);
    
    const result = await db.query(
        "DELETE FROM ratings WHERE id = $1 RETURNING *",
        [ratingId]
    );
    
    if (result.rows.length > 0 && rating.rows.length > 0) {
        await updateSalonRating(rating.rows[0].salon_id);
    }
    
    return result.rows[0];
};

module.exports = {
    createRating,
    getRatingsBySalon,
    getSalonRating,
    checkUserRating,
    updateRating,
    deleteRating,
    updateSalonRating
};
