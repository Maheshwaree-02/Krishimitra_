// backend/scripts/hashAdmin.js
const bcrypt = require('bcrypt');
const pool = require('../db');

const SALT_ROUNDS = 10;

(async () => {
    try {
        const plain = 'admin123';  // default seeded password
        const hashed = await bcrypt.hash(plain, SALT_ROUNDS);

        await pool.query(
            "UPDATE users SET password = $1 WHERE username = 'admin'",
            [hashed]
        );

        console.log("✅ Admin password updated & hashed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
})();
