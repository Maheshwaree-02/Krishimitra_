// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require token and role 'admin'
router.use(authenticateToken, authorizeRoles('admin'));

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, username, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ users: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/farms
router.get('/farms', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT f.farm_id, f.name, f.location, f.farmer_id, u.username AS farmer_name
      FROM farms f
      LEFT JOIN users u ON f.farmer_id = u.user_id
      ORDER BY f.farm_id DESC
    `);
        res.json({ farms: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/tasks
router.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT t.task_id, t.task_desc, t.status, t.farm_id, t.worker_id,
             f.name AS farm_name, u.username AS worker_name
      FROM tasks t
      LEFT JOIN farms f ON t.farm_id = f.farm_id
      LEFT JOIN users u ON t.worker_id = u.user_id
      ORDER BY t.task_id DESC
    `);
        res.json({ tasks: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
