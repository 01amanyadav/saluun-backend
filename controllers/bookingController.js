const {
 createBooking,
 getUserBookings,
 checkSlot
} = require("../models/Booking");

const bookShop = async (req,res)=>{

 try{

   const userId = req.user.id;

   const { shop_id,date,time } = req.body;

   const slotTaken = await checkSlot(
      shop_id,
      date,
      time
   );

   if(slotTaken){

     return res.status(400).json({
       message:"Time slot already booked"
     });

   }

   const booking = await createBooking(
      userId,
      shop_id,
      date,
      time
   );

   res.json(booking);

 }catch(error){

   res.status(500).json({
     message:"Server error"
   });

 }

};

const myBookings = async (req, res) => {

 try {

   const userId = req.user.id;

   const bookings = await getUserBookings(userId);

   res.json(bookings);

 } catch (error) {

   res.status(500).json({
     message:"Server error"
   });

 }

};


module.exports = {
 bookShop,
 myBookings
};