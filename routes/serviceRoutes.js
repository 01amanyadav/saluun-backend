const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateRequest");
const { createServiceSchema, updateServiceSchema } = require("../validations/schemas");

const {
    getAllServices,
    createNewService,
    getSalonServices,
    getService,
    updateServiceDetails,
    deleteServiceById
} = require("../controllers/serviceController");

// Get all services with pagination
router.get("/", getAllServices);

// Get all services for a salon
router.get("/salon/:salonId", getSalonServices);

// Get a specific service
router.get("/:id", getService);

// Protected routes - Salon Owner
router.post("/", authMiddleware, validate(createServiceSchema), createNewService);
router.put("/:id", authMiddleware, validate(updateServiceSchema), updateServiceDetails);
router.delete("/:id", authMiddleware, deleteServiceById);

module.exports = router;
