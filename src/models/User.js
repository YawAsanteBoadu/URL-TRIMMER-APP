const { pool } = require('../database/connection');
const bcrypt = require('bcrypt');

class User {
    constructor(userData) {
        this.id = userData.id;
        this.username = userData.username;
        this.email = userData.email;
        this.password_hash = userData.password_hash;
        this.created_at = userData.created_at;
    }

    // Create a new user
    static async create({ username, email, password }) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `;

        try {
            const result = await pool.query(query, [username, email, password_hash]);
            return new User(result.rows[0]);
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                if (error.constraint === 'users_email_key') {
                    throw new Error('Email already exists');
                }
                if (error.constraint === 'users_username_key') {
                    throw new Error('Username already exists');
                }
            }
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return new User(result.rows[0]);
    }

    // Find user by username
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return new User(result.rows[0]);
    }

    // Find user by username or email
    static async findByUsernameOrEmail(identifier) {
        const query = 'SELECT * FROM users WHERE username = $1 OR email = $1';
        const result = await pool.query(query, [identifier]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return new User(result.rows[0]);
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return new User(result.rows[0]);
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }

    // Get user's URL count
    async getUrlCount() {
        const query = 'SELECT COUNT(*) as count FROM urls WHERE user_id = $1';
        const result = await pool.query(query, [this.id]);
        return parseInt(result.rows[0].count);
    }

    // Convert to JSON (exclude sensitive data)
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            created_at: this.created_at
        };
    }
}

module.exports = User;