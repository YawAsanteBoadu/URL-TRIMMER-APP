const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const redisClient = require('../cache/redisClient');

// Helmet security configuration
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Rate limiting configurations
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        // Use Redis for distributed rate limiting if available
        store: redisClient.isConnected ? {
            incr: async (key) => {
                const result = await redisClient.checkRateLimit(key, max, Math.floor(windowMs / 1000));
                return result;
            },
            decrement: () => {},
            resetKey: async (key) => {
                await redisClient.client.del(`rate:${key}`);
            }
        } : undefined
    });
};

// General rate limit
const generalRateLimit = createRateLimit(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
    'Too many requests from this IP, please try again later.'
);

// Strict rate limit for auth endpoints
const authRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts, please try again later.',
    true // Skip successful requests
);

// Rate limit for URL creation
const createUrlRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    10, // 10 URLs per minute
    'Too many URLs created, please slow down.'
);

// Validation schemas
const schemas = {
    register: Joi.object({
        email: Joi.string().email().required().max(255),
        password: Joi.string().min(8).max(128).required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .message('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    createUrl: Joi.object({
        original_url: Joi.string().uri().required().max(2048),
        custom_alias: Joi.string().alphanum().min(3).max(50).optional(),
        expires_at: Joi.date().iso().greater('now').optional(),
        password: Joi.string().min(4).max(50).optional(),
        platform_reference: Joi.string().max(100).optional()
    }),

    shortenUrl: Joi.object({
        original_url: Joi.string().uri().required().max(2048),
        custom_alias: Joi.string().alphanum().min(3).max(50).optional()
    })
};

// Validation middleware factory
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        req.body = value;
        next();
    };
}

// URL blacklist check
const urlBlacklist = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'malware',
    'phishing',
    'spam'
];

function checkUrlBlacklist(req, res, next) {
    const { original_url } = req.body;
    
    if (original_url) {
        const url = original_url.toLowerCase();
        const isBlacklisted = urlBlacklist.some(domain => url.includes(domain));
        
        if (isBlacklisted) {
            return res.status(400).json({
                success: false,
                message: 'URL is not allowed'
            });
        }
    }
    
    next();
}

// HTTPS enforcement for production
function enforceHTTPS(req, res, next) {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
        return res.redirect(`https://${req.get('Host')}${req.url}`);
    }
    next();
}

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173' // Vite default
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Security headers middleware
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
}

module.exports = {
    helmetConfig,
    generalRateLimit,
    authRateLimit,
    createUrlRateLimit,
    validateRequest,
    schemas,
    checkUrlBlacklist,
    enforceHTTPS,
    corsOptions,
    securityHeaders
};