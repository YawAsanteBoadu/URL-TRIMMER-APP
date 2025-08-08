const { pool } = require('../database/connection');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

class Url {
    constructor(urlData) {
        this.id = urlData.id;
        this.short_code = urlData.short_code;
        this.original_url = urlData.original_url;
        this.custom_alias = urlData.custom_alias;
        this.expires_at = urlData.expires_at;
        this.password_hash = urlData.password_hash;
        this.click_count = urlData.click_count || 0;
        this.platform_reference = urlData.platform_reference;
        this.created_at = urlData.created_at;
        this.user_id = urlData.user_id;
    }

    // Create a new short URL
    static async create({ 
        original_url, 
        custom_alias, 
        expires_at, 
        password, 
        platform_reference, 
        user_id 
    }) {
        // Generate short code if no custom alias provided
        const short_code = custom_alias || nanoid(8);
        
        // Hash password if provided
        let password_hash = null;
        if (password) {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            password_hash = await bcrypt.hash(password, saltRounds);
        }

        const query = `
            INSERT INTO urls (
                short_code, original_url, custom_alias, expires_at, 
                password_hash, platform_reference, user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            short_code,
            original_url,
            custom_alias,
            expires_at,
            password_hash,
            platform_reference,
            user_id
        ];

        try {
            const result = await pool.query(query, values);
            return new Url(result.rows[0]);
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                if (error.constraint === 'urls_short_code_key') {
                    throw new Error('Short code already exists');
                }
                if (error.constraint === 'urls_custom_alias_key') {
                    throw new Error('Custom alias already exists');
                }
            }
            throw error;
        }
    }

    // Find URL by short code
    static async findByShortCode(short_code) {
        const query = 'SELECT * FROM urls WHERE short_code = $1';
        const result = await pool.query(query, [short_code]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return new Url(result.rows[0]);
    }

    // Find URLs by user ID
    static async findByUserId(user_id, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM urls 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [user_id, limit, offset]);
        
        return result.rows.map(row => new Url(row));
    }

    // Check if URL is expired
    isExpired() {
        if (!this.expires_at) return false;
        return new Date() > new Date(this.expires_at);
    }

    // Check if URL is password protected
    isPasswordProtected() {
        return !!this.password_hash;
    }

    // Verify password for protected URL
    async verifyPassword(password) {
        if (!this.password_hash) return true;
        return await bcrypt.compare(password, this.password_hash);
    }

    // Increment click count
    async incrementClickCount() {
        const query = `
            UPDATE urls 
            SET click_count = click_count + 1 
            WHERE id = $1 
            RETURNING click_count
        `;
        const result = await pool.query(query, [this.id]);
        this.click_count = result.rows[0].click_count;
        return this.click_count;
    }

    // Delete URL
    async delete() {
        const query = 'DELETE FROM urls WHERE id = $1';
        await pool.query(query, [this.id]);
    }

    // Get analytics data
    async getAnalytics() {
        return {
            short_code: this.short_code,
            original_url: this.original_url,
            click_count: this.click_count,
            created_at: this.created_at,
            expires_at: this.expires_at,
            platform_reference: this.platform_reference
        };
    }

    // Convert to JSON (exclude sensitive data)
    toJSON() {
        return {
            id: this.id,
            short_code: this.short_code,
            original_url: this.original_url,
            custom_alias: this.custom_alias,
            expires_at: this.expires_at,
            click_count: this.click_count,
            platform_reference: this.platform_reference,
            created_at: this.created_at,
            has_password: !!this.password_hash
        };
    }
}

module.exports = Url;