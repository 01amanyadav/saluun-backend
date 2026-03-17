const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateRequest");
const { createSalonSchema, updateSalonSchema } = require("../validations/schemas");

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
router.post("/", authMiddleware, validate(createSalonSchema), createNewSalon);
router.get("/owner/my-salons", authMiddleware, getOwnedSalons);
router.put("/:id", authMiddleware, validate(updateSalonSchema), updateSalonDetails);
router.delete("/:id", authMiddleware, deleteSalonById);

module.exports = router;
