// File: upload.js

// Global cache to store processed data
const processedStockDataByTab = {};

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('excelFile');
    const previewSection = document.getElementById('preview-section');
    const previewTable = document.getElementById('preview-table');
    const uploadContainer = document.querySelector('.upload-container');
    const analyzeButton = document.getElementById('analyzeButton');
    let currentData = null;

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator hidden';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>Processing file...</p>
    `;
    uploadContainer.appendChild(loadingIndicator);

    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('border-primary');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('border-primary');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('border-primary');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => {
            if (currentData) {
                analyzeButton.disabled = true;
                analyzeButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Analyzing...';

                try {
                    processStockData(currentData.headers, currentData.rows);
                    showSuccess('Data analyzed successfully!');
                    document.querySelector('a[href="#inventory-section"]').click();
                    document.querySelector('.tab[data-tab="ok"]').click();
                } catch (error) {
                    showError('Error analyzing data: ' + error.message);
                } finally {
                    analyzeButton.disabled = false;
                    analyzeButton.textContent = 'Analyze Data';
                }
            }
        });
    }

    function handleFileUpload(file) {
        if (!validateFile(file)) {
            showError('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        showLoading(true);
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (jsonData.length < 2) {
                    showError('The Excel file appears to be empty');
                    showLoading(false);
                    return;
                }

                processAndPreviewData(jsonData);
                showSuccess('File processed successfully!');
                if (analyzeButton) analyzeButton.disabled = false;

            } catch (error) {
                showError('Error processing the Excel file: ' + error.message);
            } finally {
                showLoading(false);
            }
        };

        reader.onerror = function() {
            showError('Error reading the file');
            showLoading(false);
        };

        reader.readAsArrayBuffer(file);
    }

    function showLoading(show) {
        loadingIndicator.classList.toggle('hidden', !show);
        uploadContainer.classList.toggle('uploading', show);
    }

    function showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'success-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'error-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    function validateFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        return validTypes.includes(file.type);
    }

    function processAndPreviewData(jsonData) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        currentData = { headers, rows };

        let tableHTML = '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        const previewRows = rows.slice(0, 10);
        previewRows.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach((_, index) => {
                tableHTML += `<td>${row[index] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody>';

        previewTable.innerHTML = tableHTML;
        previewSection.classList.remove('hidden');

        const info = document.createElement('p');
        info.className = 'text-sm text-gray-600 mt-2';
        info.textContent = `Showing ${previewRows.length} of ${rows.length} rows`;
        previewSection.appendChild(info);
    }

    function createHeaderMap(headers) {
        const mapping = {
            'NPP': 'npp',
            'TAHUN': 'tahun',
            'KATEGORI': 'kategori',
            'WP': 'wp',
            'PPB': 'ppb',
            'SBU': 'sbu',
            'AREA': 'area',
            'PELANGGAN': 'pelanggan',
            'PROYEK': 'proyek',
            'TYPE': 'type',
            'UMUR STOK': 'umur_stok',
            'RANGE UMUR': 'range_umur',
            'KETERANGAN': 'keterangan'
        };

        headers.forEach(h => {
            const upper = h.trim().toUpperCase();
            if (!mapping[upper]) mapping[upper] = h.toLowerCase().replace(/\s+/g, '_');
        });

        return mapping;
    }

    function processStockData(headers, rows) {
        const headerMap = createHeaderMap(headers);
        const data = rows.map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                const key = headerMap[header] || header;
                obj[key] = row[i];
            });
            return obj;
        });

        const categories = {
            ok: [],
            spprb: [],
            produksi: [],
            distribusi: [],
            lancar: [],
            bebas: [],
            'titipan-percepatan': [],
            'titipan-murni': []
        };

        data.forEach(item => {
            const kategori = (item.kategori || item.type || '').toLowerCase();

            if (kategori.includes('ok')) categories.ok.push(item);
            else if (kategori.includes('spprb')) categories.spprb.push(item);
            else if (kategori.includes('produksi')) categories.produksi.push(item);
            else if (kategori.includes('distribusi')) categories.distribusi.push(item);
            else if (kategori.includes('lancar')) categories.lancar.push(item);
            else if (kategori.includes('bebas')) categories.bebas.push(item);
            else if (kategori.includes('titipan percepatan')) categories['titipan-percepatan'].push(item);
            else if (kategori.includes('titipan murni')) categories['titipan-murni'].push(item);
        });

        Object.entries(categories).forEach(([tab, items]) => {
            processedStockDataByTab[tab] = items;
            updateCharts(tab, items);
        });
    }

    function updateCharts(tab, items) {
        console.log(`Updating charts for ${tab} with`, items.length, 'items');
        // TODO: Implement Chart.js logic here based on tab and items
    }
});