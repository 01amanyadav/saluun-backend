const express = require("express");

const router = express.Router();

const { getShops } = require("../controllers/shopController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

const { createShop } = require("../controllers/shopController");

const { getAvailableSlots } = require("../controllers/shopController");


router.get("/", getShops);
router.get("/:id/slots", getAvailableSlots);

router.post(
 "/",
 authMiddleware,
 adminMiddleware,
 createShop
);

module.exports = router;