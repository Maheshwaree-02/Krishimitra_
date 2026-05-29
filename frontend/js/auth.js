const API = "http://localhost:5000/api/auth";

// ---------------------- LOGIN ----------------------
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    if (!username || !password) {
        msg.textContent = "Enter username & password";
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
            msg.textContent = data.error || "Login failed";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user_id", data.user.user_id);

        if (data.user.role === "admin") location.href = "admin.html";
        else if (data.user.role === "farmer") location.href = "farmer.html";
        else location.href = "worker.html";

    } catch (err) {
        msg.textContent = "Error connecting to server.";
        console.error(err);
    }
}

// ---------------------- REGISTER ----------------------
async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    const contact_number = document.getElementById("contact_number").value.trim();
    const msg = document.getElementById("msg");

    msg.textContent = "";

    // 🔹 Basic validations
    if (!username || !password || !role) {
        msg.textContent = "All fields are required";
        return;
    }

    if (password.length < 8) {
        msg.textContent = "Password must be at least 8 characters.";
        return;
    }

    if (!contact_number || !/^\d{10}$/.test(contact_number)) {
        msg.textContent = "Enter a valid 10-digit contact number.";
        return;
    }

    // ✅ Base registration data
    let bodyData = { username, password, role, contact_number };

    // ✅ If worker, include skill and salary
    if (role === "worker") {
        const skill = document.getElementById("skill").value.trim();
        const salary = parseFloat(document.getElementById("salary").value.trim());

        if (!skill || isNaN(salary)) {
            msg.textContent = "Please provide both skill and valid salary.";
            return;
        }
        if (salary < 0) {
            msg.textContent = "Salary must be a non-negative number.";
            return;
        }

        bodyData.skill = skill;
        bodyData.salary = salary;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();
        if (!res.ok) {
            msg.textContent = data.error || "Registration failed";
            return;
        }

        msg.style.color = "green";
        msg.textContent = "Registration successful! Redirecting...";
        setTimeout(() => location.href = "index.html", 1000);

    } catch (err) {
        msg.textContent = "Error connecting to server.";
        console.error(err);
    }
}

// ✅ Toggle worker fields visibility
document.getElementById("role").addEventListener("change", (e) => {
    const role = e.target.value;
    document.getElementById("workerFields").style.display =
        role === "worker" ? "block" : "none";
});
