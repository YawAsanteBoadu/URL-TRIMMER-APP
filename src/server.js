const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware and routes
const { helmetConfig, generalRateLimit, enforceHTTPS, corsOptions, securityHeaders } = require('./middleware/security');
const routes = require('./routes');
const { testConnection } = require('./database/connection');
const redisClient = require('./cache/redisClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(enforceHTTPS);
app.use(helmetConfig);
app.use(securityHeaders);
app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting and security headers)
app.set('trust proxy', 1);

// Routes
app.use('/', routes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // CORS error
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }

    // Validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            details: error.details
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Database errors
    if (error.code === '23505') { // Unique violation
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry'
        });
    }

    if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({
            success: false,
            message: 'Invalid reference'
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
});

// Graceful shutdown
async function gracefulShutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    
    try {
        // Close Redis connection
        await redisClient.disconnect();
        console.log('✅ Redis connection closed');
        
        // Close database connections (handled by pool)
        console.log('✅ Database connections closed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Connect to Redis (optional - app will work without it)
        await redisClient.connect();

        // Start HTTP server
        app.listen(PORT, () => {
            console.log('🚀 URL Shortener API Server Started');
            console.log('='.repeat(40));
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
            console.log(`📊 Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
            console.log(`🗄️  Redis: ${redisClient.isConnected ? '✅ Connected' : '⚠️ Not Connected (Optional)'}`);
            console.log('='.repeat(40));
            console.log('📚 Available endpoints:');
            console.log('  GET  /health - Health check');
            console.log('  POST /api/auth/register - Register user');
            console.log('  POST /api/auth/login - Login user');
            console.log('  GET  /api/auth/profile - Get user profile');
            console.log('  POST /api/shorten - Shorten URL (public)');
            console.log('  POST /api/links - Create URL (authenticated)');
            console.log('  GET  /api/links - Get user URLs');
            console.log('  GET  /api/analytics/:short_code - Get analytics');
            console.log('  GET  /:short_code - Redirect to original URL');
            console.log('='.repeat(40));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;