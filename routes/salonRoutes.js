const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getSalons,
    getSalon,
    createNewSalon,
    updateSalonDetails,
    deleteSalonById,
    getOwnedSalons,
    searchAndFilter,
    getAvailableSlots
} = require("../controllers/shopController");

// Public routes
router.get("/", getSalons);
router.get("/search", searchAndFilter);
router.get("/:id", getSalon);
router.get("/:id/slots", getAvailableSlots);

// Protected routes - Salon Owner
router.post("/", authMiddleware, createNewSalon);
router.get("/owner/my-salons", authMiddleware, getOwnedSalons);
router.put("/:id", authMiddleware, updateSalonDetails);
router.delete("/:id", authMiddleware, deleteSalonById);

module.exports = router;
