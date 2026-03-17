const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addRating,
    getSalonRatings,
    getSalonAverageRating,
    updateUserRating,
    deleteUserRating
} = require("../controllers/ratingController");

// Get ratings for a salon
router.get("/salon/:salonId", getSalonRatings);
router.get("/salon/:salonId/average", getSalonAverageRating);

// Protected routes - User
router.post("/", authMiddleware, addRating);
router.put("/:ratingId", authMiddleware, updateUserRating);
router.delete("/:ratingId", authMiddleware, deleteUserRating);

module.exports = router;
