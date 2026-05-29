const token = localStorage.getItem("token");
if (!token || localStorage.getItem("role") !== "farmer") location.href = "index.html";

const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

async function addFarm() {
    const name = document.getElementById("farmName").value;
    const location = document.getElementById("farmLocation").value;
    const res = await fetch("http://localhost:5000/api/farmer/farms", {
        method: "POST", headers, body: JSON.stringify({ name, location })
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadFarms();
}

async function loadFarms() {
    const res = await fetch("http://localhost:5000/api/farmer/farms", { headers });
    const farms = await res.json();

    // ✅ Populate farm dropdown for assigning tasks
    const select = document.getElementById("farmSelect");
    select.innerHTML = "<option value=''>Select Farm</option>";
    farms.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.farm_id;
        opt.textContent = f.name;
        select.appendChild(opt);
    });

    // ✅ Also show farms list in a table
    const table = document.getElementById("farmsTable");
    table.innerHTML = "<tr><th>ID</th><th>Farm Name</th><th>Location</th></tr>";
    farms.forEach(f => {
        table.innerHTML += `
      <tr>
        <td>${f.farm_id}</td>
        <td>${f.name}</td>
        <td>${f.location || '-'}</td>
      </tr>
    `;
    });
}
async function loadFarmerProfile() {
    const res = await fetch("http://localhost:5000/api/farmer/me", { headers });
    const data = await res.json();
    if (res.ok) {
        document.getElementById("welcomeText").textContent = `Welcome, ${data.username}!`;
        document.getElementById("farmerName").textContent = `Name: ${data.username}`;
        document.getElementById("farmerContact").textContent = `📞 Contact: ${data.contact_number || 'N/A'}`;
    }
}

// ---------------------- LOAD WORKERS ----------------------
async function loadWorkers() {
    try {
        const res = await fetch("http://localhost:5000/api/farmer/workers", { headers });
        const workers = await res.json();
        const select = document.getElementById("workerSelect");

        select.innerHTML = "<option value=''>Select Worker</option>";

        (workers || []).forEach(w => {
            const opt = document.createElement("option");
            opt.value = w.user_id;
            opt.textContent = `${w.username} — ${w.skill || "No skill"} — ₹${w.salary || 0} — 📞 ${w.contact_number || "N/A"}`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error loading workers:", err);
    }
}


async function assignTask() {
    const farm_id = document.getElementById("farmSelect").value;
    const worker_id = document.getElementById("workerSelect").value;
    const task_desc = document.getElementById("taskDesc").value.trim();
    const item_id = document.getElementById("itemSelect").value; // Optional inventory item

    if (!farm_id || !worker_id || !task_desc)
        return alert("Please fill all fields.");

    const res = await fetch("http://localhost:5000/api/farmer/assign-task", {
        method: "POST",
        headers,
        body: JSON.stringify({ farm_id, worker_id, task_desc, item_id })
    });

    const data = await res.json();
    alert(data.message || "Task assigned!");
    loadInventoryDropdown(); // refresh inventory quantities
}


async function loadAssignedWorkers() {
    const res = await fetch("http://localhost:5000/api/farmer/assigned-workers", { headers });
    const workers = await res.json();
    const table = document.getElementById("assignedTable");
    table.innerHTML = "<tr><th>Worker</th><th>Farm</th><th>Task</th><th>Status</th><th>Action</th></tr>";
    workers.forEach(w => {
        table.innerHTML += `
      <tr>
        <td>${w.worker_name}</td>
        <td>${w.farm_name}</td>
        <td>${w.task_desc}</td>
        <td>${w.status}</td>
        <td><button onclick="removeWorker(${w.task_id})">Remove</button></td>
      </tr>`;
    });
}
// ---------------------- LOAD INVENTORY FOR ASSIGNMENT ----------------------
async function loadInventoryDropdown() {
    const res = await fetch("http://localhost:5000/api/farmer/inventory", { headers });
    const data = await res.json();
    const select = document.getElementById("itemSelect");
    select.innerHTML = '<option value="">-- Select Inventory Item (optional) --</option>';
    (data.inventory || []).forEach(i => {
        const opt = document.createElement("option");
        opt.value = i.item_id;
        opt.textContent = `${i.item_name} (Qty: ${i.quantity})`;
        select.appendChild(opt);
    });
}

async function removeWorker(task_id) {
    const res = await fetch(`http://localhost:5000/api/farmer/remove-worker/${task_id}`, {
        method: "DELETE", headers
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadAssignedWorkers();
}
// ---------------------- ADD INVENTORY ITEM ----------------------
async function addItem() {
    const item_name = document.getElementById("itemName").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    if (!item_name) return alert("Enter item name");

    const res = await fetch("http://localhost:5000/api/farmer/inventory", {
        method: "POST",
        headers,
        body: JSON.stringify({ item_name, quantity })
    });

    const data = await res.json();
    alert(data.message || "Item added!");
    loadInventory();
}

// ---------------------- LOAD INVENTORY ----------------------
async function loadInventory() {
    const res = await fetch("http://localhost:5000/api/farmer/inventory", { headers });
    const data = await res.json();

    const table = document.getElementById("invTable");
    table.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Quantity</th>
        <th>Actions</th>
      </tr>
    `;

    (data.inventory || []).forEach(i => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i.item_id}</td>
          <td>${i.item_name}</td>
          <td>
            <input type="number" id="qty-${i.item_id}" value="${i.quantity}" min="0" style="width:80px">
          </td>
          <td>
            <button onclick="updateItem(${i.item_id})">Update</button>
            <button onclick="deleteItem(${i.item_id})">Delete</button>
          </td>
        `;
        table.appendChild(row);
    });
}

// ---------------------- UPDATE INVENTORY ----------------------
async function updateItem(item_id) {
    const qty = document.getElementById(`qty-${item_id}`).value;
    const res = await fetch(`http://localhost:5000/api/farmer/inventory/${item_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ quantity: qty })
    });

    const data = await res.json();
    alert(data.message || "Quantity updated!");
    loadInventory();
}

// ---------------------- DELETE INVENTORY ITEM ----------------------
async function deleteItem(item_id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch(`http://localhost:5000/api/farmer/inventory/${item_id}`, {
        method: "DELETE",
        headers
    });

    const data = await res.json();
    alert(data.message || "Item deleted!");
    loadInventory();
}
function logout() {
    localStorage.clear();
    location.href = "index.html";
}


window.onload = () => {
    loadFarms();
    loadWorkers();
    loadAssignedWorkers();
    loadInventory();
    loadInventoryDropdown();
    loadFarmerProfile();
};
