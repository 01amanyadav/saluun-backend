const { getAllShops } = require("../models/shopModel");

const getShops = async (req, res) => {

    try {

        const shops = await getAllShops();

        res.json(shops);

    } catch (error) {

        res.status(500).json({
            message:"Server error"
        });

    }

};

module.exports = { getShops };

const db = require("../config/db");

const createShop = async (req,res)=>{

 try{

   const { name, location } = req.body;

   const result = await db.query(

     "INSERT INTO shops(name,location) VALUES($1,$2) RETURNING *",

     [name,location]

   );

   res.json(result.rows[0]);

 }catch(error){

   res.status(500).json({
     message:"Server error"
   });

 }

};


const getAvailableSlots = async (req,res)=>{

 try{

   const shopId = req.params.id;

   const date = req.query.date;

   if(!date){

     return res.status(400).json({
       message:"Date required"
     });

   }

   const allSlots = [

     "10:00",
     "11:00",
     "12:00",
     "13:00",
     "14:00",
     "15:00",
     "16:00",
     "17:00"

   ];

   const result = await db.query(

     "SELECT time FROM bookings WHERE shop_id=$1 AND date=$2",

     [shopId,date]

   );

   const bookedSlots = result.rows.map(
      b=>b.time
   );

   const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
   );

   res.json(availableSlots);

 }catch(error){

   res.status(500).json({
     message:"Server error"
   });

 }

};

module.exports = {

 getShops,
 createShop,
 getAvailableSlots

};