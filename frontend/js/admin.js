const token = localStorage.getItem("token");
if (!token || localStorage.getItem("role") !== "admin") location.href = "index.html";

const headers = { "Authorization": `Bearer ${token}` };

async function loadData() {
    const [users, farms, tasks] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users", { headers }),
        fetch("http://localhost:5000/api/admin/farms", { headers }),
        fetch("http://localhost:5000/api/admin/tasks", { headers })
    ]);

    const u = await users.json();
    const f = await farms.json();
    const t = await tasks.json();

    const uTable = document.getElementById("usersTable");
    u.users.forEach(row => {
        uTable.innerHTML += `<tr><td>${row.user_id}</td><td>${row.username}</td><td>${row.role}</td><td>${row.created_at}</td></tr>`;
    });

    const fTable = document.getElementById("farmsTable");
    f.farms.forEach(row => {
        fTable.innerHTML += `<tr><td>${row.farm_id}</td><td>${row.name}</td><td>${row.location}</td><td>${row.farmer_name || '-'}</td></tr>`;
    });

    const tTable = document.getElementById("tasksTable");
    t.tasks.forEach(row => {
        tTable.innerHTML += `<tr><td>${row.task_id}</td><td>${row.farm_name}</td><td>${row.worker_name || '-'}</td><td>${row.task_desc}</td><td>${row.status}</td></tr>`;
    });
}

function logout() {
    localStorage.clear();
    location.href = "index.html";
}

loadData();
