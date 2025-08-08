const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Create new user
            const user = await User.create({ email, password });

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
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Login user
    static async login(req, res) {
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
            console.error('Login error:', error);
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