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

// Login user (username-based)
router.post('/login',
    authRateLimit,
    validateRequest(schemas.login),
    AuthController.login
);

// Login user (email-based alternative)
router.post('/email-login',
    authRateLimit,
    validateRequest(schemas.emailLogin),
    AuthController.emailLogin
);

// Send verification email
router.post('/send-verification',
    authRateLimit,
    validateRequest(schemas.verification),
    AuthController.sendVerification
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