const express = require('express');
const authRoutes = require('./auth');
const urlRoutes = require('./urls');
const redirectRoutes = require('./redirect');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'URL Shortener API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api', urlRoutes);

// Redirect routes (at root level)
router.use('/', redirectRoutes);

module.exports = router;