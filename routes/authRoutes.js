const express = require("express");
const router = express.Router();

const validate = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../validations/schemas");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

module.exports = router;