const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Check if username already exists
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            // Check if email already exists
            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Create new user
            const user = await User.create({ username, email, password });

            // Generate JWT token
            const token = generateToken(user.id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.message.includes('already exists')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Find user by username
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Verify password
            const isValidPassword = await user.verifyPassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Generate JWT token
            const token = generateToken(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Alternative email login
    static async emailLogin(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isValidPassword = await user.verifyPassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = generateToken(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Email login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Email verification endpoint
    static async sendVerification(req, res) {
        try {
            const { email } = req.body;

            // Check if user exists
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // TODO: Implement email verification logic
            // For now, just return success
            res.json({
                success: true,
                message: 'Verification email sent successfully'
            });
        } catch (error) {
            console.error('Send verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = req.user; // Set by authentication middleware

            // Get user's URL count
            const urlCount = await user.getUrlCount();

            res.json({
                success: true,
                data: {
                    ...user.toJSON(),
                    url_count: urlCount
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout (client-side token removal, server can't invalidate JWT without blacklisting)
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Logout successful. Please remove the token from client storage.'
        });
    }
}

module.exports = AuthController;