// Chart instances
let sbuChart, pbbChart, yearChart;

// Chart colors
const chartColors = {
    primary: '#0047AB',
    secondary: '#4B9CD3',
    accent: '#72A0C1',
    background: 'rgba(0, 71, 171, 0.1)'
};

// Initialize charts
function initializeCharts() {
    // Destroy existing charts if they exist
    if (sbuChart) sbuChart.destroy();
    if (pbbChart) pbbChart.destroy();
    if (yearChart) yearChart.destroy();

    // Initialize SBU Chart
    const sbuCtx = document.getElementById('sbuChart').getContext('2d');
    sbuChart = new Chart(sbuCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Jumlah Stok',
                data: [],
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 1
            }]
        },
        options: getChartOptions('Jumlah Stok per SBU')
    });

    // Initialize PBB Chart
    const pbbCtx = document.getElementById('pbbChart').getContext('2d');
    pbbChart = new Chart(pbbCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Jumlah Stok',
                data: [],
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 1
            }]
        },
        options: getChartOptions('Jumlah Stok per PBB')
    });

    // Initialize Year Chart
    const yearCtx = document.getElementById('yearChart').getContext('2d');
    yearChart = new Chart(yearCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Jumlah Stok',
                data: [],
                backgroundColor: chartColors.accent,
                borderColor: chartColors.accent,
                borderWidth: 1
            }]
        },
        options: getChartOptions('Jumlah Stok per Tahun')
    });
}

// Update charts with new data
function updateCharts(data) {
    if (!data) return;

    // Update SBU Chart
    if (sbuChart && data.sbuData) {
        sbuChart.data.labels = data.sbuData.labels;
        sbuChart.data.datasets[0].data = data.sbuData.values;
        sbuChart.update();
    }

    // Update PBB Chart
    if (pbbChart && data.pbbData) {
        pbbChart.data.labels = data.pbbData.labels;
        pbbChart.data.datasets[0].data = data.pbbData.values;
        pbbChart.update();
    }

    // Update Year Chart
    if (yearChart && data.yearData) {
        yearChart.data.labels = data.yearData.labels;
        yearChart.data.datasets[0].data = data.yearData.values;
        yearChart.update();
    }
}

// Process chart data
function processChartData(data, type) {
    const grouped = {};
    
    data.forEach(item => {
        const key = item[type] || 'Unknown';
        if (!grouped[key]) {
            grouped[key] = 0;
        }
        grouped[key] += parseFloat(item.jumlah_stok) || 0;
    });

    return {
        labels: Object.keys(grouped),
        values: Object.values(grouped)
    };
}

// Calculate metrics
function calculateMetrics(data) {
    const totalStock = data.reduce((sum, item) => sum + (parseFloat(item.jumlah_stok) || 0), 0);
    const currentBalance = data.reduce((sum, item) => sum + (parseFloat(item.saldo) || 0), 0);
    
    // Calculate average stock age
    const totalAge = data.reduce((sum, item) => {
        const age = item.umur_stok ? parseFloat(item.umur_stok) : 0;
        return sum + (age * (parseFloat(item.jumlah_stok) || 0));
    }, 0);
    
    const averageAge = totalStock > 0 ? (totalAge / totalStock).toFixed(1) : 0;

    return {
        totalStock: totalStock.toFixed(0),
        currentBalance: currentBalance.toFixed(2),
        averageAge
    };
}

// Get common chart options
function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 14,
                    family: "'Montserrat', sans-serif",
                    weight: '600'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        family: "'Montserrat', sans-serif"
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: "'Montserrat', sans-serif"
                    }
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 20,
                bottom: 10
            }
        }
    };
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('sbuChart')) {
        initializeCharts();
        // Load any existing data
        const currentTab = window.currentTab || 'site';
        const data = getStoredData(currentTab);
        if (data) {
            updateDashboardData(currentTab);
        }
    }
});
