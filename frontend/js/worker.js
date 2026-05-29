const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "worker") location.href = "index.html";

const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

// ---------------------- FETCH WORKER PROFILE ----------------------
async function loadWorkerProfile() {
    try {
        const res = await fetch("http://localhost:5000/api/worker/profile", { headers });
        const data = await res.json();

        if (res.ok && data.worker) {
            document.getElementById("workerName").textContent = `Name: ${data.worker.username}`;
            document.getElementById("workerContact").textContent = `📞 Contact: ${data.worker.contact_number || 'N/A'}`;
            document.getElementById("welcomeText").textContent = `👷 Welcome, ${data.worker.username}!`;
        } else {
            console.warn("No worker profile data found:", data);
        }
    } catch (err) {
        console.error("Error loading worker profile:", err);
    }
}

// ---------------------- LOAD TASKS ----------------------
async function loadTasks() {
    try {
        const res = await fetch("http://localhost:5000/api/worker/tasks", { headers });
        const tasks = await res.json();

        const table = document.getElementById("tasksTable");
        table.innerHTML = "<tr><th>Farm</th><th>Task</th><th>Status</th><th>Action</th></tr>";

        (tasks || []).forEach(t => {
            table.innerHTML += `
                <tr>
                    <td>${t.farm_name}</td>
                    <td>${t.task_desc}</td>
                    <td>${t.status}</td>
                    <td>${t.status === 'completed' ? '✔️' : `<button onclick="completeTask(${t.task_id})">Mark Done</button>`}</td>
                </tr>`;
        });
    } catch (err) {
        console.error("Error loading tasks:", err);
    }
}

// ---------------------- MARK TASK AS COMPLETED ----------------------
async function completeTask(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/worker/tasks/${id}/complete`, {
            method: "PUT", headers
        });
        const data = await res.json();
        alert(data.message || data.error);
        loadTasks();
    } catch (err) {
        console.error("Error completing task:", err);
    }
}

// ---------------------- LOGOUT ----------------------
function logout() {
    localStorage.clear();
    location.href = "index.html";
}

// ---------------------- INITIAL LOAD ----------------------
window.onload = () => {
    loadWorkerProfile();
    loadTasks();

};
