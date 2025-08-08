const express = require('express');
const UrlController = require('../controllers/urlController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateRequest, schemas, createUrlRateLimit, checkUrlBlacklist } = require('../middleware/security');

const router = express.Router();

// Public URL shortening endpoint
router.post('/shorten',
    createUrlRateLimit,
    validateRequest(schemas.shortenUrl),
    checkUrlBlacklist,
    optionalAuth, // Optional authentication
    UrlController.shortenUrl
);

// Authenticated URL creation with full features
router.post('/links',
    authenticateToken,
    createUrlRateLimit,
    validateRequest(schemas.createUrl),
    checkUrlBlacklist,
    UrlController.createUrl
);

// Get user's URLs (paginated)
router.get('/links',
    authenticateToken,
    UrlController.getUserUrls
);

// Get URL analytics
router.get('/analytics/:short_code',
    authenticateToken,
    UrlController.getAnalytics
);

// Delete URL
router.delete('/links/:short_code',
    authenticateToken,
    UrlController.deleteUrl
);

module.exports = router;