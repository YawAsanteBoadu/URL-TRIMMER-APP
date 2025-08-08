const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting database migration...');
    
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await pool.query(schema);
        console.log('✅ Database migration completed successfully');
    } catch (error) {
        console.error('❌ Database migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrate();
}

module.exports = migrate;