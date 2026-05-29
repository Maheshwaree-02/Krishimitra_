const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });

    try {
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (userCheck.rows.length === 0)
            return res.status(400).json({ error: "Invalid username or password" });

        const user = userCheck.rows[0];

        // verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ error: "Invalid username or password" });

        // check approval for farmer
        if (user.role === "farmer" && !user.is_approved)
            return res.status(403).json({ error: "Account pending admin approval" });

        // create JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
