const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
 bookShop,
 myBookings
} = require("../controllers/bookingController");


router.post("/", authMiddleware, bookShop);

router.get("/my-bookings", authMiddleware, myBookings);


module.exports = router;