// File upload handling
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

    // Drag and Drop
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

    // Manual File Input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Analyze button click
    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => {
            if (currentData) {
                analyzeButton.disabled = true;
                analyzeButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Analyzing...';
                
                try {
                    processStockData(currentData.headers, currentData.rows);
                    showSuccess('Data analyzed successfully!');
                    
                    const inventoryLink = document.querySelector('a[href="#inventory-section"]');
                    const siteTab = document.querySelector('.tab[data-tab="ok"]');
                    
                    if (inventoryLink) inventoryLink.click();
                    else console.error('Link ke #inventory-section tidak ditemukan');
                    
                    if (siteTab) siteTab.click();
                    else console.error('Tab dengan data-tab="ok" tidak ditemukan');                                      
                } catch (error) {
                    showError('Error analyzing data: ' + error.message);
                } finally {
                    analyzeButton.disabled = false;
                    analyzeButton.textContent = 'Analyze Data';
                }
            }
        });
    }

    // Read and parse file
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
                if (analyzeButton) {
                    analyzeButton.disabled = false;
                }
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
        if (show) {
            loadingIndicator.classList.remove('hidden');
            uploadContainer.classList.add('uploading');
        } else {
            loadingIndicator.classList.add('hidden');
            uploadContainer.classList.remove('uploading');
        }
    }

    function showSuccess(message) {
        const successAlert = document.createElement('div');
        successAlert.className = 'success-alert';
        successAlert.textContent = message;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
    }

    function showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'error-alert';
        errorAlert.textContent = message;
        document.body.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 3000);
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

        const rowCountInfo = document.createElement('p');
        rowCountInfo.className = 'text-sm text-gray-600 mt-2';
        rowCountInfo.textContent = `Showing ${previewRows.length} of ${rows.length} rows`;
        previewSection.appendChild(rowCountInfo);
    }

    // Process stock data: mapping semua header dan categorizing
    function processStockData(headers, rows) {
        const headerMap = createHeaderMap(headers);

        const data = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                const standardField = headerMap[header] || header;
                obj[standardField] = row[index];
            });
            return obj;
        });

        const categorizedData = categorizeStockData(data);

        Object.entries(categorizedData).forEach(([type, typeData]) => {
            storeData(type, typeData);        // simpan data mentah
            updateCharts(type, typeData);     // update chart sesuai tab
        });
    }

    // Mapping semua header: lowercase dan ganti spasi jadi underscore
    function createHeaderMap(headers) {
        const headerMap = {};
        headers.forEach(header => {
            headerMap[header] = header.toLowerCase().trim().replace(/\s+/g, '_');
        });
        return headerMap;
    }

    // Kategorisasi berdasarkan isi field tipe_stok
    function categorizeStockData(data) {
        const categories = {
            ok: [], spprb: [], produksi: [], distribusi: [], lancar: [],
            bebas: [], titipan_percepatan: [], titipan_murni: [],
            titipan_op: [], titipan_ppb: [], site: []
        };

        data.forEach(item => {
            const stockType = (item.tipe_stok || '').toLowerCase();

            if (stockType.includes('ok')) categories.ok.push(item);
            else if (stockType.includes('spprb')) categories.spprb.push(item);
            else if (stockType.includes('produksi')) categories.produksi.push(item);
            else if (stockType.includes('distribusi')) categories.distribusi.push(item);
            else if (stockType.includes('lancar')) categories.lancar.push(item);
            else if (stockType.includes('bebas')) categories.bebas.push(item);
            else if (stockType.includes('titipan-percepatan')) categories.titipan_percepatan.push(item);
            else if (stockType.includes('titipan-murni')) categories.titipan_murni.push(item);
            else if (stockType.includes('op')) categories.titipan_op.push(item);
            else if (stockType.includes('ppb')) categories.titipan_ppb.push(item);
            else if (stockType.includes('site')) categories.site.push(item);
        });

        return categories;
    }

    // Update charts per kategori stok
    function updateCharts(type, data) {
        switch (type) {
            case 'ok':
                renderOKCharts(data); break;
            case 'spprb':
                renderSPPRBCharts(data); break;
            case 'produksi':
                renderProduksiCharts(data); break;
            case 'distribusi':
                renderDistribusiCharts(data); break;
            case 'lancar':
                renderStokLancarCharts(data); break;
            case 'bebas':
                renderStokBebasCharts(data); break;
            case 'titipan_percepatan':
                renderTitipanPercepatanCharts(data); break;
            case 'titipan_murni':
                renderTitipanMurniCharts(data); break;
            case 'titipan_op':
                renderTitipanOPCharts(data); break;
            case 'titipan_ppb':
                renderTitipanPPBCharts(data); break;
            case 'site':
                renderSiteCharts(data); break;
        }
    }
});
