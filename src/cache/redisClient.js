const redis = require('redis');
require('dotenv').config();

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Redis client connected');
                this.isConnected = true;
            });

            this.client.on('disconnect', () => {
                console.log('⚠️ Redis client disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error.message);
            this.isConnected = false;
            // Don't throw error - allow app to work without Redis
            return null;
        }
    }

    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
        }
    }

    // Cache URL data for quick redirection
    async cacheUrl(short_code, urlData, ttl = 3600) {
        if (!this.isConnected) return false;

        try {
            const cacheData = {
                original_url: urlData.original_url,
                expires_at: urlData.expires_at,
                has_password: !!urlData.password_hash,
                id: urlData.id
            };

            await this.client.setEx(
                `url:${short_code}`, 
                ttl, 
                JSON.stringify(cacheData)
            );
            return true;
        } catch (error) {
            console.error('Redis cache set error:', error);
            return false;
        }
    }

    // Get cached URL data
    async getCachedUrl(short_code) {
        if (!this.isConnected) return null;

        try {
            const cached = await this.client.get(`url:${short_code}`);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            console.error('Redis cache get error:', error);
            return null;
        }
    }

    // Delete cached URL
    async deleteCachedUrl(short_code) {
        if (!this.isConnected) return false;

        try {
            await this.client.del(`url:${short_code}`);
            return true;
        } catch (error) {
            console.error('Redis cache delete error:', error);
            return false;
        }
    }

    // Cache frequently accessed URLs with higher TTL
    async cachePopularUrl(short_code, urlData, ttl = 7200) {
        return await this.cacheUrl(short_code, urlData, ttl);
    }

    // Increment click count in cache (for analytics)
    async incrementClickCount(short_code) {
        if (!this.isConnected) return 0;

        try {
            const key = `clicks:${short_code}`;
            const count = await this.client.incr(key);
            // Set expiry for click counter (24 hours)
            await this.client.expire(key, 86400);
            return count;
        } catch (error) {
            console.error('Redis click increment error:', error);
            return 0;
        }
    }

    // Get cached click count
    async getCachedClickCount(short_code) {
        if (!this.isConnected) return 0;

        try {
            const count = await this.client.get(`clicks:${short_code}`);
            return parseInt(count) || 0;
        } catch (error) {
            console.error('Redis click count get error:', error);
            return 0;
        }
    }

    // Rate limiting helper
    async checkRateLimit(identifier, limit = 100, window = 900) {
        if (!this.isConnected) return { allowed: true, remaining: limit };

        try {
            const key = `rate:${identifier}`;
            const current = await this.client.incr(key);
            
            if (current === 1) {
                await this.client.expire(key, window);
            }

            const remaining = Math.max(0, limit - current);
            const allowed = current <= limit;

            return { allowed, remaining, current };
        } catch (error) {
            console.error('Redis rate limit error:', error);
            return { allowed: true, remaining: limit };
        }
    }

    // Health check
    async ping() {
        if (!this.isConnected) return false;

        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Redis ping error:', error);
            return false;
        }
    }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;