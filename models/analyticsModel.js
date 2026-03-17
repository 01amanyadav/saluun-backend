const db = require("../config/db");

const updateSalonAnalytics = async (salonId, date = null) => {
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    // Get booking stats
    const bookingStats = await db.query(
        `SELECT 
            COUNT(*) as total_bookings,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
         FROM bookings 
         WHERE salon_id = $1 AND DATE(date) = $2`,
        [salonId, queryDate]
    );
    
    // Get revenue
    const revenue = await db.query(
        `SELECT COALESCE(SUM(s.price), 0) as total_revenue
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.salon_id = $1 AND b.status = 'completed' AND DATE(b.date) = $2`,
        [salonId, queryDate]
    );
    
    // Get average rating
    const rating = await db.query(
        "SELECT AVG(rating) as average_rating FROM ratings WHERE salon_id = $1",
        [salonId]
    );
    
    const stats = bookingStats.rows[0];
    const rev = revenue.rows[0];
    const avg_rating = rating.rows[0].average_rating || 0;
    
    // Insert or update analytics
    const result = await db.query(
        `INSERT INTO salon_analytics(salon_id, total_bookings, completed_bookings, cancelled_bookings, total_revenue, average_rating, date)
         VALUES($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (salon_id, date) DO UPDATE SET
            total_bookings = $2,
            completed_bookings = $3,
            cancelled_bookings = $4,
            total_revenue = $5,
            average_rating = $6,
            updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [salonId, stats.total_bookings, stats.completed_bookings, stats.cancelled_bookings, rev.total_revenue, avg_rating, queryDate]
    );
    
    return result.rows[0];
};

const getSalonAnalytics = async (salonId, startDate = null, endDate = null) => {
    let query = "SELECT * FROM salon_analytics WHERE salon_id = $1";
    const params = [salonId];
    
    if (startDate && endDate) {
        query += " AND date BETWEEN $2 AND $3";
        params.push(startDate, endDate);
    }
    
    query += " ORDER BY date DESC";
    
    const result = await db.query(query, params);
    return result.rows;
};

const getSalonStats = async (salonId) => {
    const result = await db.query(
        `SELECT 
            SUM(total_bookings) as total_bookings,
            SUM(completed_bookings) as completed_bookings,
            SUM(cancelled_bookings) as cancelled_bookings,
            SUM(total_revenue) as total_revenue,
            AVG(average_rating) as average_rating
         FROM salon_analytics
         WHERE salon_id = $1`,
        [salonId]
    );
    
    return result.rows[0];
};

module.exports = {
    updateSalonAnalytics,
    getSalonAnalytics,
    getSalonStats
};
