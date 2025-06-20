// ==== 📁 FILE: charts.js ====
console.log("📈 charts.js loaded");

window.chartInstances = {}; // Global chart instance

function initializeCharts() {
    function createChart(ctx, label, defaultData = [0]) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Default Label'],
                datasets: [{
                    label: label,
                    data: defaultData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function initChart(chartId, label) {
        const ctx = document.getElementById(chartId);
        if (ctx) {
            window.chartInstances[chartId] = createChart(ctx, label);
            addEmptyMessage(ctx);
        }
    }

    // Inisialisasi semua chart
    [
        ['chart-ok-sbu', 'Stok OK SBU'],
        ['chart-spprb-sbu', 'Stok SPPRB SBU'],
        ['chart-produksi', 'Stok Produksi'],
        ['chart-distribusi-saldo', 'Distribusi Saldo'],
        ['chart-lancar-tahun', 'Lancar per Tahun'],
        ['chart-bebas-proyek', 'Bebas per Proyek'],
        ['chart-percepatan-sbu', 'Titipan Percepatan per SBU'],
        ['chart-murni-ppb', 'Titipan Murni per PPB'],
        ['chart-op-ppb', 'OP per PPB'],
        ['chart-ppb-ppb', 'PPB - PPB'],
        ['chart-site-ppb', 'Site - PPB']
    ].forEach(([id, label]) => initChart(id, label));
}

function addEmptyMessage(canvasElement) {
    const container = canvasElement.parentNode;
    const message = document.createElement('div');
    message.className = 'empty-chart-message';
    message.textContent = 'Data kosong atau belum dimuat';
    container.insertBefore(message, canvasElement.nextSibling);
}

document.addEventListener('DOMContentLoaded', initializeCharts);


// ==== 📁 FILE: upload.js ====
console.log("📥 upload.js loaded");

document.addEventListener('DOMContentLoaded', function () {
    console.log("📦 upload.js masuk ke DOM");

    const excelFileInput = document.getElementById('excelFile');
    const previewSection = document.getElementById('preview-section');
    const previewTable = document.getElementById('preview-table');
    const analyzeButton = document.getElementById('analyzeButton');

    const COLUMN_MAPPING = {
        'chart-ok-sbu': 11,
        'chart-spprb-sbu': 13,
        'chart-produksi': 15,
        'chart-distribusi-saldo': 17,
        'chart-lancar-tahun': 19,
        'chart-bebas-proyek': 21,
        'chart-percepatan-sbu': 23,
        'chart-murni-ppb': 25,
        'chart-op-ppb': 27,
        'chart-ppb-ppb': 29,
        'chart-site-ppb': 31
    };

    excelFileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) throw new Error("No data found in the sheet");

                displayPreview(jsonData);
            } catch (error) {
                console.error("❌ Error processing file:", error);
                alert("Error processing file: " + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    });

    function displayPreview(data) {
        previewTable.innerHTML = '';

        const headerRow = document.createElement('tr');
        headerRow.className = 'bg-gray-100';
        data[0].forEach(header => {
            const th = document.createElement('th');
            th.className = 'px-4 py-2 border';
            th.textContent = header || 'Column';
            headerRow.appendChild(th);
        });
        previewTable.appendChild(headerRow);

        for (let i = 1; i < data.length; i++) {
            const row = document.createElement('tr');
            data[i].forEach((cell) => {
                const td = document.createElement('td');
                td.className = 'px-4 py-2 border';
                td.textContent = cell;
                row.appendChild(td);
            });
            previewTable.appendChild(row);
        }

        previewSection.classList.remove('hidden');
        analyzeButton.disabled = false;
    }

    analyzeButton.addEventListener('click', function () {
        try {
            const data = getDataFromPreview();
            if (!data || data.length < 2) throw new Error("No valid data to analyze");

            updateAllCharts(data);
            localStorage.setItem('wika-latest-data', JSON.stringify(data));
            alert("Data successfully analyzed and charts updated!");
        } catch (error) {
            console.error("❌ Error in analysis:", error);
            alert("Analysis error: " + error.message);
        }
    });

    function getDataFromPreview() {
        const rows = Array.from(previewTable.querySelectorAll('tr'));
        return rows.map(row => Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent));
    }

    function updateAllCharts(data) {
        const chartData = {};
        Object.keys(COLUMN_MAPPING).forEach(chartId => chartData[chartId] = []);

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            Object.entries(COLUMN_MAPPING).forEach(([chartId, colIndex]) => {
                if (row.length > colIndex) {
                    const value = parseFloat(row[colIndex]) || 0;
                    chartData[chartId].push(value);
                }
            });
        }

        Object.entries(chartData).forEach(([chartId, values]) => {
            const chart = window.chartInstances[chartId];
            if (!chart) return;

            const labels = Array.from({ length: values.length }, (_, i) => `Item ${i + 1}`);
            chart.data.labels = labels;
            chart.data.datasets[0].data = values;
            chart.update();

            const messageElement = chart.canvas.nextElementSibling;
            if (messageElement && messageElement.classList.contains('empty-chart-message')) {
                const isEmpty = values.length === 0 || values.every(val => val === 0);
                messageElement.style.display = isEmpty ? 'block' : 'none';
            }
        });
    }

    window.updateAllCharts = updateAllCharts; // Make available globally
});