// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, skill, salary, contact_number } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'username, password and role are required' });
        }

        const allowedRoles = ['admin', 'farmer', 'worker'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if username exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        let result;
        // ✅ For worker, insert skill & salary too
        if (role === 'worker') {
            result = await pool.query(
                `INSERT INTO users (username, password, role, skill, salary, contact_number, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING user_id, username, role, skill, salary, contact_number`,
                [username, hashed, role, skill || null, salary || null, contact_number || null]
            );
        } else {
            result = await pool.query(
                `INSERT INTO users (username, password, role, contact_number, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING user_id, username, role, contact_number`,
                [username, hashed, role, contact_number || null]
            );
        }


        res.json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'username and password required' });

        const result = await pool.query('SELECT user_id, username, password, role FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const tokenPayload = { user_id: user.user_id, username: user.username, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

        res.json({ message: 'Login successful', token, user: tokenPayload });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
