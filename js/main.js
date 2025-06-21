// Global state
let currentTab = 'ok';  // default tab
let currentSection = 'inventory-section';

// DOM ready
document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    setupEventListeners();
    handleInitialNavigation();
});

// Initial setup
function initializeDashboard() {
    showSection('inventory-section');
    switchTab(currentTab);

    // Pastikan fungsi ini sudah didefinisikan di upload.js atau charts.js dan sudah dimuat
    if (typeof initializeCharts === 'function') {
        initializeCharts();
    } else {
        console.warn("⚠️ initializeCharts() belum didefinisikan.");
    }
}

// All event listeners
function setupEventListeners() {
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.querySelectorAll('.nav-link span').forEach(span => {
                span.classList.toggle('hidden');
            });
        });
    }

    // Sidebar nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-target');
            if (!target) return;
            e.preventDefault();

            showSection(target);

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// When URL changes (hash-based navigation)
function handleInitialNavigation() {
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        showSection(sectionId);

        const navLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
        if (navLink) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            navLink.classList.add('active');
        }
    }
}

// Show selected section only
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        currentSection = sectionId;

        // Init chart on inventory
        if (sectionId === 'inventory-section') {
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
        }

        const scrollPosition = window.scrollY;
        window.location.hash = sectionId;
        window.scrollTo(0, scrollPosition);
    }
}

// Switch between tab contents
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    currentTab = tabName;
    updateDashboardData(tabName);
}

// Update dashboard metrics
function updateDashboardData(tabName) {
    const data = getStoredData(tabName);
    if (!data) {
        resetDashboardData();
        return;
    }

    // Update metrics
    document.getElementById('total-stock')?.textContent = data.totalStock || '0';
    document.getElementById('current-balance')?.textContent = data.currentBalance || '0';
    document.getElementById('avg-age')?.textContent = data.averageAge || '0';

    // Update charts
    if (typeof updateCharts === 'function') {
        updateCharts(tabName, data);
    }
}

// Reset dashboard values
function resetDashboardData() {
    document.getElementById('total-stock')?.textContent = '0';
    document.getElementById('current-balance')?.textContent = '0';
    document.getElementById('avg-age')?.textContent = '0';

    if (typeof updateCharts === 'function') {
        updateCharts(currentTab, {
            sbuData: { labels: [], values: [] },
            pbbData: { labels: [], values: [] },
            yearData: { labels: [], values: [] }
        });
    }
}

// Get local storage
function getStoredData(tabName) {
    const storedData = localStorage.getItem(`wika-data-${tabName}`);
    return storedData ? JSON.parse(storedData) : null;
}

// Simpan ke local storage
function storeData(tabName, data) {
    localStorage.setItem(`wika-data-${tabName}`, JSON.stringify(data));
    if (currentTab === tabName && currentSection === 'inventory-section') {
        updateDashboardData(tabName);
    }
}

// Global alert error
function showError(message) {
    const div = document.createElement('div');
    div.className = 'error-alert';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Global alert success
function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success-alert';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Re-handle section if hash changes manually
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        showSection(sectionId);
    }
});
