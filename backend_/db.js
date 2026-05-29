// backend/db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

pool.connect()
    .then(() => console.log("✅ Connected to PostgreSQL Database"))
    .catch((err) => console.error("❌ Database Connection Error:", err));

module.exports = pool;
