// frontend/js/login.js

const API_BASE = "http://localhost:5000/api";  // backend base url

// frontend/js/login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Login failed");
            return;
        }

        // ✅ Save details
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // ✅ Redirect based on role
        if (data.role === "admin") {
            window.location.href = "../pages/admin.html";
        } else if (data.role === "farmer") {
            window.location.href = "../pages/farmer.html";
        } else if (data.role === "worker") {
            window.location.href = "../pages/worker.html";
        } else {
            alert("Unknown role!");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Server error during login");
    }
});

