// ================================
// 📦 Upload & Data Processing Module
// ================================

if (!window.processedStockDataByTab) {
    window.processedStockDataByTab = {};
}

const tabList = [
    'ok', 'spprb', 'produksi', 'distribusi', 'lancar', 'bebas',
    'titipan-percepatan', 'titipan-murni', 'op', 'ppb', 'site'
];

let currentData = null;

function initializeProcessedDataStructure() {
    window.processedStockDataByTab = {};
    tabList.forEach(tab => {
        window.processedStockDataByTab[tab] = [];
    });
}

function createHeaderMap(headers) {
    const map = {
        'NPP': 'npp', 'TAHUN': 'tahun', 'KATEGORI': 'kategori', 'WP': 'wp',
        'PPB': 'ppb', 'SBU': 'sbu', 'AREA': 'area', 'PELANGGAN': 'pelanggan',
        'PROYEK': 'proyek', 'TYPE': 'type', 'UMUR STOK': 'umur_stok',
        'RANGE UMUR': 'range_umur', 'KETERANGAN': 'keterangan'
    };
    headers.forEach(h => {
        const upper = h.trim().toUpperCase();
        if (!map[upper]) map[upper] = h.toLowerCase().replace(/\s+/g, '_');
    });
    return map;
}

function processStockData(headers, rows) {
    initializeProcessedDataStructure();
    const headerMap = createHeaderMap(headers);

    const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            const key = headerMap[header] || header;
            obj[key] = row[i];
        });
        return obj;
    });

    const tabKeyMatch = {
        'titipan-percepatan': ['titipan percepatan'],
        'titipan-murni': ['titipan murni']
        // Tab lain bisa ditambahkan manual jika perlu
    };

    data.forEach(item => {
        tabList.forEach(tab => {
            const keywords = tabKeyMatch[tab] || [tab.replace('-', ' ')];
            const isMatch = keywords.some(keyword =>
                Object.keys(item).some(k => k.toLowerCase().includes(keyword))
            );
            if (isMatch) {
                window.processedStockDataByTab[tab].push(item);
            }
        });
    });

    tabList.forEach(tab => {
        const items = Array.isArray(window.processedStockDataByTab[tab]) ? window.processedStockDataByTab[tab] : [];
        localStorage.setItem(`wika-data-${tab}`, JSON.stringify(items));
        if (typeof updateCharts === 'function') updateCharts(tab, items);
    });

    console.log('✅ Data berhasil diproses dan disimpan ke localStorage:', window.processedStockDataByTab);
}

function runAnalysis() {
    const analyzeButton = document.getElementById('analyzeButton');
    analyzeButton.disabled = true;
    analyzeButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Analyzing...';

    try {
        processStockData(currentData.headers, currentData.rows);
        showSuccess('Data analyzed successfully!');
        document.querySelector('button[data-target="inventory-section"]').click();
        document.querySelector('.tab[data-tab="ok"]').click();
    } catch (error) {
        showError('Error analyzing data: ' + error.message);
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Analyze Data';
    }
}

window.initializeCharts = function () {
    console.log("📊 initializeCharts() dipanggil");
    initializeProcessedDataStructure();
    tabList.forEach(tab => {
        const raw = localStorage.getItem(`wika-data-${tab}`);
        try {
            const parsed = JSON.parse(raw);
            const data = Array.isArray(parsed) ? parsed : [];
            updateCharts(tab, data);
        } catch {
            updateCharts(tab, []);
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('excelFile');
    const previewSection = document.getElementById('preview-section');
    const uploadContainer = document.querySelector('#upload-section .bg-white');
    const loadingIndicator = document.createElement('div');

    loadingIndicator.className = 'loading-indicator hidden';
    loadingIndicator.innerHTML = `<div class="spinner"></div><p>Processing file...</p>`;
    uploadContainer.appendChild(loadingIndicator);

    fileInput.addEventListener('change', e => {
        if (e.target.files.length) handleFileUpload(e.target.files[0]);
    });

    uploadContainer.addEventListener('dragover', e => {
        e.preventDefault();
        uploadContainer.classList.add('border-primary');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('border-primary');
    });

    uploadContainer.addEventListener('drop', e => {
        e.preventDefault();
        uploadContainer.classList.remove('border-primary');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    function handleFileUpload(file) {
        if (!validateFile(file)) {
            showError('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        showLoading(true);
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                if (jsonData.length < 2) return showError('The Excel file appears to be empty');
                currentData = { headers: jsonData[0], rows: jsonData.slice(1) };
                renderPreview(currentData);
                showSuccess('File processed successfully!');
            } catch (err) {
                showError('Error processing the Excel file: ' + err.message);
            } finally {
                showLoading(false);
            }
        };
        reader.onerror = () => showError('Error reading the file');
        reader.readAsArrayBuffer(file);
    }

    function validateFile(file) {
        return [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ].includes(file.type);
    }

    function showLoading(show) {
        loadingIndicator.classList.toggle('hidden', !show);
        uploadContainer.classList.toggle('uploading', show);
    }

    function showSuccess(msg) {
        const el = document.createElement('div');
        el.className = 'success-alert';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    function showError(msg) {
        const el = document.createElement('div');
        el.className = 'error-alert';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    function renderPreview({ headers, rows }) {
        const previewRows = rows.slice(0, 10);
        let table = '<div style="overflow-x:auto; border:1px solid #ccc; border-radius:6px; max-width:1000px; margin:auto;">';
        table += '<table style="border-collapse:collapse; width:100%; min-width:1000px; font-size:13px;">';
        table += '<thead><tr>' + headers.map(h => `<th style="border:1px solid #ccc; padding:4px; white-space:nowrap;">${h}</th>`).join('') + '</tr></thead><tbody>';
        table += previewRows.map(row => '<tr>' + headers.map((_, i) => `<td style="border:1px solid #ccc; padding:4px; white-space:nowrap;">${row[i] || ''}</td>`).join('') + '</tr>').join('');
        table += '</tbody></table></div>';

        previewSection.innerHTML = `
            <h2 class="text-lg font-semibold mb-4 text-center">Data Preview</h2>
            ${table}
            <div class="mt-6 flex justify-center">
                <button id="analyzeButton" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
                    Analyze Data
                </button>
            </div>
            <p class="text-sm text-gray-600 mt-2 text-center">Showing ${previewRows.length} of ${rows.length} rows</p>
        `;

        const analyzeButton = document.getElementById('analyzeButton');
        if (analyzeButton) {
            analyzeButton.addEventListener('click', () => {
                if (currentData) runAnalysis();
            });
        }

        previewSection.classList.remove('hidden');
    }

    initializeCharts();
});
