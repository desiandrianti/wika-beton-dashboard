// 📦 Cache untuk menyimpan instance chart agar bisa destroy jika diperbarui
const chartInstances = {};

// 🔧 Normalisasi key (misal 'RANGE UMUR' → 'range_umur')
function normalizeKey(rawKey) {
    return rawKey.toLowerCase().replace(/\s+/g, '_');
}

// 🔄 Group data berdasarkan key
function groupBy(items, rawKey) {
    const key = normalizeKey(rawKey);
    const map = {};
    items.forEach(item => {
        const val = item[key] ?? 'Lainnya';
        map[val] = (map[val] || 0) + 1;
    });
    return {
        labels: Object.keys(map),
        values: Object.values(map),
        label: `Jumlah per ${rawKey.toUpperCase()}`
    };
}

const canvasId = `chart-${tab}-${key}`;
const canvas = document.getElementById(canvasId);

if (!canvas) {
    console.warn(`⛔ Elemen ${canvasId} tidak ditemukan`);
    return;
}

const ctx = canvas.getContext("2d");

// 🎨 Fungsi umum render chart
function renderChart(canvasId, type, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    const config = {
        type: type,
        data: {
            labels: data.labels,
            datasets: [{
                label: data.label || 'Jumlah',
                data: data.values,
                backgroundColor: type === 'pie' ? generateColors(data.values.length) : '#3b82f6',
                borderColor: type === 'line' ? '#10b981' : undefined,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: type === 'bar' || type === 'line' ? { y: { beginAtZero: true } } : {},
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: canvasId.replace('chart-', '').replace(/-/g, ' ').toUpperCase()
                }
            },
            ...options
        }
    };

    chartInstances[canvasId] = new Chart(ctx, config);
}

// 🌈 Warna acak untuk pie
function generateColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.floor(Math.random() * 360);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

// 🧩 Struktur tab dan chart yang ingin dirender
const tabChartConfig = {
    ok: {
        'SBU': 'bar',
        'PPB': 'bar',
        'AREA': 'pie',
        'TAHUN': 'line',
        'RANGE UMUR': 'pie'
    },
    spprb: {
        'SBU': 'bar',
        'PPB': 'bar',
        'AREA': 'pie',
        'TAHUN': 'line',
        'RANGE UMUR': 'pie'
    },
    produksi: {
        'SBU': 'bar',
        'PPB': 'bar',
        'AREA': 'pie',
        'TAHUN': 'line',
        'RANGE UMUR': 'pie'
    },
    distribusi: {
        'SBU': 'bar',
        'STOK DISTRIBUSI': 'bar',
        'SALDO DISTRIBUSI': 'bar',
        'RANGE UMUR': 'bar'
    },
    lancar: {
        'SBU': 'bar',
        'PPB': 'bar',
        'STOK LANCAR': 'bar',
        'SALDO LANCAR': 'bar'
    },
    bebas: {
        'SBU': 'bar',
        'PPB': 'bar',
        'STOK BEBAS': 'bar',
        'SALDO BEBAS': 'bar'
    },
    'titipan-percepatan': {
        'SBU': 'bar',
        'PPB': 'bar',
        'STOK TITIPAN PERCEPATAN': 'bar',
        'SALDO TITIPAN PERCEPATAN': 'bar'
    },
    'titipan-murni': {
        'SBU': 'bar',
        'PPB': 'bar',
        'STOK TITIPAN MURNI': 'bar',
        'SALDO TITIPAN MURNI': 'bar'
    },
    op: {
        'STOK OP': 'bar',
        'SALDO OP': 'bar'
    },
    ppb: {
        'STOK PPB': 'bar',
        'SALDO PPB': 'bar'
    },
    site: {
        'STOK SITE': 'bar',
        'SALDO SITE': 'bar'
    }
};

// 🚀 Fungsi utama: update chart berdasarkan tab & data
function updateCharts(tab, items) {
    if (!Array.isArray(items)) {
        console.warn(`⚠️ Data untuk tab "${tab}" bukan array.`);
        items = [];
    }

    if (items.length === 0) {
        console.warn(`⚠️ Tidak ada data untuk tab "${tab}".`);
        return;
    }

    const config = tabChartConfig[tab];
    if (!config) {
        console.warn(`⚠️ Tidak ada konfigurasi chart untuk tab "${tab}"`);
        return;
    }

    for (const [key, chartType] of Object.entries(config)) {
        const chartId = `chart-${tab}-${normalizeKey(key)}`;
        const chartData = groupBy(items, key);
        renderChart(chartId, chartType, chartData);
    }
}

// 📊 Inisialisasi semua chart dengan dummy data
function initializeDefaultCharts() {
    const emptyData = {
        labels: ['No Data'],
        values: [1],
        label: 'Tidak Ada Data'
    };

    Object.entries(tabChartConfig).forEach(([tab, config]) => {
        for (const key of Object.keys(config)) {
            const chartId = `chart-${tab}-${normalizeKey(key)}`;
            renderChart(chartId, config[key], emptyData, {
                plugins: {
                    title: {
                        display: true,
                        text: 'Data Belum Tersedia'
                    }
                }
            });
        }
    });
}
