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

    // Handle drag and drop
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

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Handle analyze button click
    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => {
            if (currentData) {
                analyzeButton.disabled = true;
                analyzeButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Analyzing...';
                
                try {
                    processStockData(currentData.headers, currentData.rows);
                    showSuccess('Data analyzed successfully!');
                    
                    // Navigate to inventory section and show the first tab
                    document.querySelector('a[href="#inventory-section"]').click();
                    document.querySelector('.tab[data-tab="site"]').click();
                } catch (error) {
                    showError('Error analyzing data: ' + error.message);
                } finally {
                    analyzeButton.disabled = false;
                    analyzeButton.textContent = 'Analyze Data';
                }
            }
        });
    }

    // Process uploaded file
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
                
                // Enable analyze button
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

    // Show/hide loading indicator
    function showLoading(show) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
            uploadContainer.classList.add('uploading');
        } else {
            loadingIndicator.classList.add('hidden');
            uploadContainer.classList.remove('uploading');
        }
    }

    // Show success message
    function showSuccess(message) {
        const successAlert = document.createElement('div');
        successAlert.className = 'success-alert';
        successAlert.textContent = message;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
    }

    // Show error message
    function showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'error-alert';
        errorAlert.textContent = message;
        document.body.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 3000);
    }

    // Validate file type
    function validateFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        return validTypes.includes(file.type);
    }

    // Process and display preview
    function processAndPreviewData(jsonData) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Store current data for analyze button
        currentData = { headers, rows };

        // Create table header
        let tableHTML = '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        // Create table rows (limit to first 10 rows for preview)
        const previewRows = rows.slice(0, 10);
        previewRows.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach((_, index) => {
                tableHTML += `<td>${row[index] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody>';

        // Display preview
        previewTable.innerHTML = tableHTML;
        previewSection.classList.remove('hidden');

        // Add row count information
        const rowCountInfo = document.createElement('p');
        rowCountInfo.className = 'text-sm text-gray-600 mt-2';
        rowCountInfo.textContent = `Showing ${previewRows.length} of ${rows.length} rows`;
        previewSection.appendChild(rowCountInfo);
    }

    // Process stock data
    function processStockData(headers, rows) {
        // Map headers to standardized field names
        const headerMap = createHeaderMap(headers);

        // Convert rows to objects using header mapping
        const data = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                const standardField = headerMap[header] || header;
                obj[standardField] = row[index];
            });
            return obj;
        });

        // Categorize data by stock type
        const categorizedData = categorizeStockData(data);

        // Store processed data and update visualizations
        Object.entries(categorizedData).forEach(([type, typeData]) => {
            const processedData = {
                ...calculateMetrics(typeData),
                sbuData: processChartData(typeData, 'sbu'),
                pbbData: processChartData(typeData, 'pbb'),
                yearData: processChartData(typeData, 'tahun')
            };
            storeData(type, processedData);
        });
    }

    // Create header mapping
    function createHeaderMap(headers) {
        // Map various possible header names to standardized fields
        const mapping = {
            'SBU': 'sbu',
            'PBB': 'pbb',
            'Tahun': 'tahun',
            'Jumlah Stok': 'jumlah_stok',
            'Saldo': 'saldo',
            'Umur Stok': 'umur_stok',
            'Tipe Stok': 'tipe_stok'
        };

        const headerMap = {};
        headers.forEach(header => {
            headerMap[header] = mapping[header] || header.toLowerCase().replace(/\s+/g, '_');
        });

        return headerMap;
    }

    // Categorize stock data
    function categorizeStockData(data) {
        const categories = {
            site: [],
            pabrik: [],
            bebas: [],
            titipan: []
        };

        data.forEach(item => {
            const stockType = (item.tipe_stok || '').toLowerCase();
            
            if (stockType.includes('site')) {
                categories.site.push(item);
            } else if (stockType.includes('pabrik')) {
                categories.pabrik.push(item);
            } else if (stockType.includes('bebas')) {
                categories.bebas.push(item);
            } else if (stockType.includes('titipan')) {
                categories.titipan.push(item);
            }
        });

        return categories;
    }
});
