const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Generate JWT token
function generateToken(userId) {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            issuer: 'url-shortener-api'
        }
    );
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Authentication middleware
async function authenticateToken(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Optional authentication middleware (for endpoints that work with or without auth)
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
}

// Check if user owns the resource
function checkOwnership(req, res, next) {
    // This middleware should be used after authenticateToken
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    // Resource ownership will be checked in the controller
    next();
}

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    optionalAuth,
    checkOwnership
};