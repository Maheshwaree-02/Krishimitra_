// frontend/js/charts.js
// Fixed & Optimized for Dark Theme + Glassmorphism

function initCharts() {
    Chart.defaults.color = '#e2e8f0';           // Text color
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)'; // Grid lines

    // ==================== YIELD TREND CHART ====================
    const yieldCtx = document.getElementById('yieldChart');
    if (yieldCtx) {
        new Chart(yieldCtx, {
            type: 'line',
            data: {
                labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Crop Yield (Tons)',
                    data: [3.2, 3.8, 4.1, 4.5, 4.9, 5.3],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    tension: 0.4,
                    borderWidth: 4,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e2937',
                        titleColor: '#fff',
                        bodyColor: '#94a3b8',
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8', font: { size: 12 } }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8', font: { size: 12 } }
                    }
                }
            }
        });
    }

    // ==================== WEATHER / SOIL CHART ====================
    const weatherCtx = document.getElementById('weatherChart');
    if (weatherCtx) {
        new Chart(weatherCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Soil Moisture (%)',
                        data: [65, 72, 68, 75],
                        backgroundColor: '#34d399',
                        borderRadius: 8,
                        barThickness: 25
                    },
                    {
                        label: 'Rainfall (mm)',
                        data: [45, 80, 30, 55],
                        backgroundColor: '#60a5fa',
                        borderRadius: 8,
                        barThickness: 25
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#e2e8f0', padding: 15, usePointStyle: true }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // ==================== TASK COMPLETION (Doughnut) ====================
    const taskCtx = document.getElementById('taskChart');
    if (taskCtx) {
        new Chart(taskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'In Progress'],
                datasets: [{
                    data: [68, 22, 10],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                    borderColor: '#0f172a',
                    borderWidth: 5,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 18,
                            font: { size: 13 },
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // ==================== PERFORMANCE CHART (Worker) ====================
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [8, 12, 15, 19],
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    tension: 0.4,
                    borderWidth: 3.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    console.log("✅ All charts initialized successfully!");
}

// Make globally accessible
window.initCharts = initCharts;