const express = require('express');
const UrlController = require('../controllers/urlController');
const { generalRateLimit } = require('../middleware/security');

const router = express.Router();

// URL redirection endpoint
router.get('/:short_code',
    generalRateLimit,
    UrlController.redirectUrl
);

module.exports = router;