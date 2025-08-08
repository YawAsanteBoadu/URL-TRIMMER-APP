const Joi = require('joi');

/**
 * User Registration Schema
 * Equivalent to userSignUpSchema in Zod
 */
const userSignUpSchema = Joi.object({
    username: Joi.string().min(3).required()
        .messages({
            'string.min': 'Username must be at least 3 characters long',
            'any.required': 'Username is required'
        }),
    email: Joi.string().email().required().max(255)
        .messages({
            'string.email': 'Invalid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string().min(6).max(15).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,15}$'))
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password must be at most 15 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
});

/**
 * User Login Schema
 * Equivalent to userLoginSchema in Zod
 */
const userLoginSchema = Joi.object({
    username: Joi.string().min(3).required()
        .messages({
            'string.min': 'Invalid username',
            'any.required': 'Username is required'
        }),
    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

/**
 * User Email Login Schema
 * Alternative login with email instead of username
 */
const userEmailLoginSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Invalid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

/**
 * User Verification Schema
 * Equivalent to userVerificationSchema in Zod
 */
const userVerificationSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Invalid email address',
            'any.required': 'Email is required'
        })
});

/**
 * URL Creation Schema (Authenticated)
 */
const createUrlSchema = Joi.object({
    original_url: Joi.string().uri().required().max(2048)
        .messages({
            'string.uri': 'Invalid URL format',
            'string.max': 'URL is too long',
            'any.required': 'Original URL is required'
        }),
    custom_alias: Joi.string().alphanum().min(3).max(50).optional()
        .messages({
            'string.alphanum': 'Custom alias must contain only letters and numbers',
            'string.min': 'Custom alias must be at least 3 characters long',
            'string.max': 'Custom alias must be at most 50 characters long'
        }),
    expires_at: Joi.date().iso().greater('now').optional()
        .messages({
            'date.greater': 'Expiration date must be in the future'
        }),
    password: Joi.string().min(4).max(50).optional()
        .messages({
            'string.min': 'Password must be at least 4 characters long',
            'string.max': 'Password must be at most 50 characters long'
        }),
    platform_reference: Joi.string().max(100).optional()
        .messages({
            'string.max': 'Platform reference must be at most 100 characters long'
        })
});

/**
 * URL Shortening Schema (Public)
 */
const shortenUrlSchema = Joi.object({
    original_url: Joi.string().uri().required().max(2048)
        .messages({
            'string.uri': 'Invalid URL format',
            'string.max': 'URL is too long',
            'any.required': 'Original URL is required'
        }),
    custom_alias: Joi.string().alphanum().min(3).max(50).optional()
        .messages({
            'string.alphanum': 'Custom alias must contain only letters and numbers',
            'string.min': 'Custom alias must be at least 3 characters long',
            'string.max': 'Custom alias must be at most 50 characters long'
        })
});

// Type inference helpers (equivalent to z.infer in Zod)
/**
 * @typedef {Object} CreateUserInput
 * @property {string} username - User's username (min 3 chars)
 * @property {string} email - User's email address
 * @property {string} password - User's password (6-15 chars, mixed case + number)
 */

/**
 * @typedef {Object} LoginUserInput
 * @property {string} username - User's username
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} EmailLoginInput
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} VerificationInput
 * @property {string} email - User's email address for verification
 */

/**
 * @typedef {Object} CreateUrlInput
 * @property {string} original_url - The original long URL
 * @property {string} [custom_alias] - Optional custom alias
 * @property {string} [expires_at] - Optional expiration date (ISO string)
 * @property {string} [password] - Optional password protection
 * @property {string} [platform_reference] - Optional platform reference
 */

/**
 * @typedef {Object} ShortenUrlInput
 * @property {string} original_url - The original long URL
 * @property {string} [custom_alias] - Optional custom alias
 */

module.exports = {
    // Main schemas
    userSignUpSchema,
    userLoginSchema,
    userEmailLoginSchema,
    userVerificationSchema,
    createUrlSchema,
    shortenUrlSchema,
    
    // Aliases for backward compatibility
    register: userSignUpSchema,
    login: userLoginSchema,
    emailLogin: userEmailLoginSchema,
    verification: userVerificationSchema,
    createUrl: createUrlSchema,
    shortenUrl: shortenUrlSchema
};