const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createNewService,
    getSalonServices,
    getService,
    updateServiceDetails,
    deleteServiceById
} = require("../controllers/serviceController");

// Get all services for a salon
router.get("/salon/:salonId", getSalonServices);

// Get a specific service
router.get("/:id", getService);

// Protected routes - Salon Owner
router.post("/", authMiddleware, createNewService);
router.put("/:id", authMiddleware, updateServiceDetails);
router.delete("/:id", authMiddleware, deleteServiceById);

module.exports = router;
