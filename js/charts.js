function processStockData(headers, rows) {
    const headerMap = createHeaderMap(headers);
    const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            const field = headerMap[header] || header.toLowerCase().replace(/\s+/g, '_');
            obj[field] = row[i];
        });
        return obj;
    });

    const categorizedData = categorizeStockData(data);
    const chartDataMap = {};

    Object.entries(categorizedData).forEach(([category, dataRows]) => {
        chartDataMap[category] = {
            sbuData: processChartData(dataRows, 'sbu'),
            pbbData: processChartData(dataRows, 'pbb'),
            tahunData: processChartData(dataRows, 'tahun')
        };
    });

    updateCharts(chartDataMap);
}
