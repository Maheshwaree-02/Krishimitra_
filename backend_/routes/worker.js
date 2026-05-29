// backend/routes/worker.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken, authorizeRoles('worker'));

// ➤ Get all tasks assigned to this worker
router.get('/tasks', async (req, res) => {
    try {
        const worker_id = req.user.user_id;
        const result = await pool.query(`
      SELECT 
        t.task_id, 
        t.task_desc, 
        t.status, 
        f.name AS farm_name
      FROM tasks t
      JOIN farms f ON t.farm_id = f.farm_id
      WHERE t.worker_id = $1
    `, [worker_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// ➤ Mark task as completed
router.put('/tasks/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const worker_id = req.user.user_id;

        const result = await pool.query(
            `UPDATE tasks SET status='completed' WHERE task_id=$1 AND worker_id=$2 RETURNING *`,
            [id, worker_id]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ error: 'Task not found or unauthorized' });

        res.json({ message: 'Task marked as completed!' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// Get worker profile
router.get('/profile', authenticateToken, authorizeRoles('worker'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT username, contact_number, role FROM users WHERE user_id = $1',
            [req.user.user_id]
        );
        res.json({ worker: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
