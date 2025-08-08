const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas, authRateLimit } = require('../middleware/security');

const router = express.Router();

// Register new user
router.post('/register', 
    authRateLimit,
    validateRequest(schemas.register),
    AuthController.register
);

// Login user
router.post('/login',
    authRateLimit,
    validateRequest(schemas.login),
    AuthController.login
);

// Get current user profile (protected)
router.get('/profile',
    authenticateToken,
    AuthController.getProfile
);

// Logout (protected)
router.post('/logout',
    authenticateToken,
    AuthController.logout
);

module.exports = router;