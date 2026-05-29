// backend/routes/farmer.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken, authorizeRoles('farmer'));

// ➤ Add a new farm
router.post('/farms', async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name) return res.status(400).json({ error: 'Farm name required' });

        const farmer_id = req.user.user_id;
        await pool.query(
            `INSERT INTO farms (name, location, farmer_id) VALUES ($1, $2, $3)`,
            [name, location || '', farmer_id]
        );
        res.json({ message: 'Farm added successfully!' });
    } catch (err) {
        console.error('Error adding farm:', err);
        res.status(500).json({ error: 'Failed to add farm' });
    }
});

// ➤ Get all farms for this farmer
router.get('/farms', async (req, res) => {
    try {
        const farmer_id = req.user.user_id;
        const result = await pool.query(
            `SELECT farm_id, name, location FROM farms WHERE farmer_id = $1`,
            [farmer_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching farms:', err);
        res.status(500).json({ error: 'Failed to fetch farms' });
    }
});


// ✅ Get all available workers with skill, salary, contact
router.get("/workers", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, username, skill, salary, contact_number 
             FROM users 
             WHERE role = 'worker'`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching workers:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



// ➤ Assign a task to a worker
// Assign task to a worker (and optionally reduce inventory)
router.post('/assign-task', async (req, res) => {
    const client = await pool.connect();
    try {
        const { farm_id, worker_id, task_desc, item_id } = req.body;
        if (!farm_id || !worker_id || !task_desc)
            return res.status(400).json({ error: 'All fields are required' });

        await client.query('BEGIN');

        // Insert the task
        await client.query(
            'INSERT INTO tasks (farm_id, worker_id, task_desc) VALUES ($1, $2, $3)',
            [farm_id, worker_id, task_desc]
        );

        // If an inventory item was used → reduce its quantity
        if (item_id) {
            const checkQty = await client.query(
                'SELECT quantity FROM inventory WHERE item_id = $1 AND farmer_id = $2',
                [item_id, req.user.user_id]
            );
            if (checkQty.rows.length === 0)
                throw new Error('Item not found in inventory');
            if (checkQty.rows[0].quantity <= 0)
                throw new Error('Item is out of stock');

            await client.query(
                'UPDATE inventory SET quantity = quantity - 1 WHERE item_id = $1 AND farmer_id = $2',
                [item_id, req.user.user_id]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Task assigned successfully!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error assigning task:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


// ➤ View assigned workers and their task status
router.get('/assigned-workers', async (req, res) => {
    try {
        const farmer_id = req.user.user_id;
        const result = await pool.query(`
      SELECT 
        t.task_id,
        u.username AS worker_name,
        f.name AS farm_name,
        t.task_desc,
        t.status
      FROM tasks t
      JOIN users u ON t.worker_id = u.user_id
      JOIN farms f ON t.farm_id = f.farm_id
      WHERE f.farmer_id = $1
    `, [farmer_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching assigned workers:', err);
        res.status(500).json({ error: 'Failed to fetch assigned workers' });
    }
});

// ➤ Remove worker (delete task)
router.delete('/remove-worker/:task_id', async (req, res) => {
    try {
        const { task_id } = req.params;
        const farmer_id = req.user.user_id;

        const result = await pool.query(`
      DELETE FROM tasks
      WHERE task_id = $1
      AND farm_id IN (SELECT farm_id FROM farms WHERE farmer_id = $2)
      RETURNING *
    `, [task_id, farmer_id]);

        if (result.rowCount === 0)
            return res.status(404).json({ error: 'Task not found or unauthorized' });

        res.json({ message: 'Worker removed successfully' });
    } catch (err) {
        console.error('Error removing worker:', err);
        res.status(500).json({ error: 'Failed to remove worker' });
    }
});
// ---------------------- INVENTORY ROUTES ----------------------

// ➕ Add item to inventory
router.post('/inventory', async (req, res) => {
    try {
        const { item_name, quantity } = req.body;
        if (!item_name) return res.status(400).json({ error: 'Item name is required' });

        const qty = parseInt(quantity || '0', 10);
        await pool.query(
            'INSERT INTO inventory (farmer_id, item_name, quantity) VALUES ($1, $2, $3)',
            [req.user.user_id, item_name, qty]
        );

        res.json({ message: 'Inventory item added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 📋 View farmer’s inventory
router.get('/inventory', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT item_id, item_name, quantity FROM inventory WHERE farmer_id = $1 ORDER BY item_id DESC',
            [req.user.user_id]
        );
        res.json({ inventory: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✏️ Update item quantity
router.put('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        await pool.query(
            'UPDATE inventory SET quantity = $1 WHERE item_id = $2 AND farmer_id = $3',
            [quantity, id, req.user.user_id]
        );
        res.json({ message: 'Inventory updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ❌ Delete item
router.delete('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            'DELETE FROM inventory WHERE item_id = $1 AND farmer_id = $2',
            [id, req.user.user_id]
        );
        res.json({ message: 'Item deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Get logged-in farmer info
router.get('/me', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT username, contact_number FROM users WHERE user_id = $1',
            [req.user.user_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Farmer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch farmer details' });
    }
});

module.exports = router;
