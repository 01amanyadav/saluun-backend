const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { findUserByEmail, createUser } = require("../models/userModel");

class AuthService {
    /**
     * Register a new user
     */
    static async register(name, email, password) {
        try {
            logger.info("User registration initiated", { email });

            // Check if user already exists
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                logger.warn("Registration attempt for existing email", { email });
                const error = new Error("Email already registered");
                error.statusCode = 400;
                throw error;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await createUser(name, email, hashedPassword);

            logger.info("User registered successfully", { userId: user.id, email });

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || "customer"
            };
        } catch (error) {
            logger.error("Registration failed", { error: error.message, email });
            throw error;
        }
    }

    /**
     * Login user and return JWT token
     */
    static async login(email, password) {
        try {
            logger.info("User login attempted", { email });

            // Find user
            const user = await findUserByEmail(email);
            if (!user) {
                logger.warn("Login attempt for non-existent user", { email });
                const error = new Error("Invalid email or password");
                error.statusCode = 401;
                throw error;
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                logger.warn("Login attempt with wrong password", { email });
                const error = new Error("Invalid email or password");
                error.statusCode = 401;
                throw error;
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role || "customer"
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            logger.info("User logged in successfully", { userId: user.id, email });

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || "customer"
                }
            };
        } catch (error) {
            logger.error("Login failed", { error: error.message, email });
            throw error;
        }
    }

    /**
     * Verify JWT token
     */
    static async verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            logger.warn("Token verification failed", { error: error.message });
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        try {
            const db = require("../config/db");
            const result = await db.query(
                "SELECT id, name, email, role FROM users WHERE id = $1",
                [userId]
            );
            if (result.rows.length === 0) {
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            return result.rows[0];
        } catch (error) {
            logger.error("Failed to get user", { error: error.message, userId });
            throw error;
        }
    }
}

module.exports = AuthService;

