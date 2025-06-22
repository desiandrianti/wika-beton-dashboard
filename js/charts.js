// File: charts.js

// Cache Chart.js instances
const chartInstances = {};

function updateCharts(tab, items) {
    switch (tab) {
        case 'ok':
            renderOKCharts(items);
            break;
        case 'spprb':
            renderSPPRBCharts(items);
            break;
        case 'produksi':
            renderProduksiCharts(items);
            break;
        case 'distribusi':
            renderDistribusiCharts(items);
            break;
        case 'lancar':
            renderLancarCharts(items);
            break;
        case 'bebas':
            renderBebasCharts(items);
            break;
        case 'titipan-percepatan':
            renderTitipanPercepatanCharts(items);
            break;
        case 'titipan-murni':
            renderTitipanMurniCharts(items);
            break;
        case 'op':
            renderOPCharts(items);
            break;
        case 'ppb':
            renderPPBCharts(items);
            break;
        case 'site':
            renderSiteCharts(items);
            break;
        default:
            console.warn(`⚠️ No chart handler for tab "${tab}"`);
    }
}

function initializeCharts() {
    console.log("📊 initializeCharts() dipanggil - inisialisasi awal grafik");
    const tabs = [
        'ok', 'spprb', 'produksi', 'distribusi',
        'lancar', 'bebas', 'titipan-percepatan', 'titipan-murni','op','ppb','site'
    ];
    tabs.forEach(tab => updateCharts(tab, [])); // Kosong dulu
}

// Contoh sederhana tiap render function:

function renderOKCharts(items) {
    renderBarChart('chart-ok-sbu', groupBy(items, 'sbu'));
    renderBarChart('chart-ok-ppb', groupBy(items, 'ppb'));
    renderLineChart('chart-ok-tren', groupBy(items, 'tahun'));
    renderPieChart('chart-ok-range', groupBy(items, 'range_umur'));
}

function renderSPPRBCharts(items) {
    renderBarChart('chart-spprb-sbu', groupBy(items, 'sbu'));
    renderBarChart('chart-spprb-ppb', groupBy(items, 'ppb'));
}

function renderProduksiCharts(items) {
    renderBarChart('chart-produksi-sbu', groupBy(items, 'sbu'));
    renderBarChart('chart-produksi-ppb', groupBy(items, 'ppb'));
}

function renderDistribusiCharts(items) {
    renderBarChart('chart-distribusi-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-distribusi-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-distribusi-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-distribusi-saldo', groupBy(items, 'range_umur'));
}

function renderLancarCharts(items) {
    renderBarChart('chart-lancar-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-lancar-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-lancar-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-lancar-saldo', groupBy(items, 'range_umur'))
}

function renderBebasCharts(items) {
    renderBarChart('chart-bebas-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-bebas-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-bebas-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-bebas-saldo', groupBy(items, 'range_umur'))
}

function renderTitipanPercepatanCharts(items) {
    renderBarChart('chart-percepatan-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-percepatan-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-percepatan-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-percepatan-saldo', groupBy(items, 'range_umur'))
}

function renderTitipanMurniCharts(items) {
    renderBarChart('chart-murni-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-murni-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-murni-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-murni-saldo', groupBy(items, 'range_umur'))
}

function renderOPCharts(items) {
    renderBarChart('chart-op-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-op-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-op-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-op-saldo', groupBy(items, 'range_umur'))
}

function renderPPBCharts(items) {
    renderBarChart('chart-ppb-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-ppb-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-ppb-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-ppb-saldo', groupBy(items, 'range_umur'))
}

function renderSiteCharts(items) {
    renderBarChart('chart-site-stok', groupBy(items, 'sbu'));
    renderBarChart('chart-site-saldo', groupBy(items, 'sbu'));
    renderBarChart('chart-site-stok', groupBy(items, 'range_umur'));
    renderBarChart('chart-site-saldo', groupBy(items, 'range_umur'))
}

// Helper untuk group data
function groupBy(items, key) {
    const map = {};
    items.forEach(item => {
        const val = item[key] || 'Lainnya';
        map[val] = (map[val] || 0) + 1;
    });
    return {
        labels: Object.keys(map),
        values: Object.values(map)
    };
}

// Render Bar Chart
function renderBarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Jumlah',
                data: data.values,
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Render Pie Chart
function renderPieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: generateColors(data.values.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Render Line Chart
function renderLineChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Tren',
                data: data.values,
                borderColor: '#10b981',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Generate random colors for pie chart
function generateColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.floor(Math.random() * 360);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}
