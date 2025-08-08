const Url = require('../models/Url');
const redisClient = require('../cache/redisClient');

class UrlController {
    // Public URL shortening endpoint
    static async shortenUrl(req, res) {
        try {
            const { original_url, custom_alias } = req.body;
            const user_id = req.user ? req.user.id : null;

            // Create short URL
            const urlData = await Url.create({
                original_url,
                custom_alias,
                user_id
            });

            // Cache the URL for quick redirection
            await redisClient.cacheUrl(urlData.short_code, urlData);

            // Build short URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const short_url = `${baseUrl}/${urlData.short_code}`;

            res.json({
                success: true,
                data: {
                    short_url,
                    original_url: urlData.original_url,
                    short_code: urlData.short_code
                }
            });
        } catch (error) {
            console.error('URL shortening error:', error);
            
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

    // Authenticated URL creation with full features
    static async createUrl(req, res) {
        try {
            const { original_url, custom_alias, expires_at, password, platform_reference } = req.body;
            const user_id = req.user.id;

            // Create short URL with all features
            const urlData = await Url.create({
                original_url,
                custom_alias,
                expires_at: expires_at ? new Date(expires_at) : null,
                password,
                platform_reference,
                user_id
            });

            // Cache the URL for quick redirection
            await redisClient.cacheUrl(urlData.short_code, urlData);

            // Build short URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const short_url = `${baseUrl}/${urlData.short_code}`;

            res.status(201).json({
                success: true,
                message: 'URL created successfully',
                data: {
                    short_url,
                    ...urlData.toJSON()
                }
            });
        } catch (error) {
            console.error('URL creation error:', error);
            
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

    // Get user's URLs
    static async getUserUrls(req, res) {
        try {
            const user_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            // Get user's URLs
            const urls = await Url.findByUserId(user_id, limit, offset);

            // Build full URLs
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const urlsWithShortUrl = urls.map(url => ({
                ...url.toJSON(),
                short_url: `${baseUrl}/${url.short_code}`
            }));

            res.json({
                success: true,
                data: {
                    urls: urlsWithShortUrl,
                    pagination: {
                        page,
                        limit,
                        has_more: urls.length === limit
                    }
                }
            });
        } catch (error) {
            console.error('Get user URLs error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Redirect to original URL
    static async redirectUrl(req, res) {
        try {
            const { short_code } = req.params;
            const { password } = req.query;

            // Try to get from cache first
            let urlData = await redisClient.getCachedUrl(short_code);
            let url = null;

            if (urlData) {
                // If cached, we still need the full URL object for password verification
                if (urlData.has_password) {
                    url = await Url.findByShortCode(short_code);
                }
            } else {
                // Not in cache, get from database
                url = await Url.findByShortCode(short_code);
                
                if (!url) {
                    return res.status(404).json({
                        success: false,
                        message: 'URL not found'
                    });
                }

                urlData = {
                    original_url: url.original_url,
                    expires_at: url.expires_at,
                    has_password: url.isPasswordProtected(),
                    id: url.id
                };

                // Cache for future requests
                await redisClient.cacheUrl(short_code, url);
            }

            // Check if URL is expired
            if (urlData.expires_at && new Date() > new Date(urlData.expires_at)) {
                return res.status(404).json({
                    success: false,
                    message: 'URL has expired'
                });
            }

            // Check password if required
            if (urlData.has_password) {
                if (!password) {
                    return res.status(403).json({
                        success: false,
                        message: 'Password required',
                        requires_password: true
                    });
                }

                // Verify password using the full URL object
                const isValidPassword = await url.verifyPassword(password);
                if (!isValidPassword) {
                    return res.status(403).json({
                        success: false,
                        message: 'Invalid password'
                    });
                }
            }

            // Increment click count asynchronously
            if (url) {
                url.incrementClickCount().catch(console.error);
            } else {
                // If we only have cached data, increment in cache
                redisClient.incrementClickCount(short_code).catch(console.error);
            }

            // Redirect to original URL
            res.redirect(301, urlData.original_url);
        } catch (error) {
            console.error('URL redirection error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get URL analytics
    static async getAnalytics(req, res) {
        try {
            const { short_code } = req.params;
            const user_id = req.user.id;

            // Find URL and verify ownership
            const url = await Url.findByShortCode(short_code);
            
            if (!url) {
                return res.status(404).json({
                    success: false,
                    message: 'URL not found'
                });
            }

            // Check if user owns this URL
            if (url.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get analytics data
            const analytics = await url.getAnalytics();

            // Get cached click count if available
            const cachedClicks = await redisClient.getCachedClickCount(short_code);
            if (cachedClicks > 0) {
                analytics.recent_clicks = cachedClicks;
            }

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Delete URL
    static async deleteUrl(req, res) {
        try {
            const { short_code } = req.params;
            const user_id = req.user.id;

            // Find URL and verify ownership
            const url = await Url.findByShortCode(short_code);
            
            if (!url) {
                return res.status(404).json({
                    success: false,
                    message: 'URL not found'
                });
            }

            // Check if user owns this URL
            if (url.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Delete from database
            await url.delete();

            // Remove from cache
            await redisClient.deleteCachedUrl(short_code);

            res.json({
                success: true,
                message: 'URL deleted successfully'
            });
        } catch (error) {
            console.error('Delete URL error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = UrlController;