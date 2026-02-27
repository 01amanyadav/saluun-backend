const db = require("../config/db");

const createBooking = async (userId, shopId, date, time) => {

    const result = await db.query(

        "INSERT INTO bookings(user_id,shop_id,date,time) VALUES($1,$2,$3,$4) RETURNING *",

        [userId, shopId, date, time]

    );

    return result.rows[0];

};

const getUserBookings = async (userId) => {

    const result = await db.query(

        `SELECT bookings.id, shops.name, bookings.date, bookings.time
         FROM bookings
         JOIN shops ON bookings.shop_id = shops.id
         WHERE bookings.user_id=$1`,

        [userId]

    );

    return result.rows;

};

const checkSlot = async (shopId,date,time)=>{

 const result = await db.query(

  "SELECT * FROM bookings WHERE shop_id=$1 AND date=$2 AND time=$3",

  [shopId,date,time]

 );

 return result.rows[0];

};

module.exports = {
 createBooking,
 getUserBookings,
 checkSlot
};