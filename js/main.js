// Global state management
let currentTab = 'site';
let currentSection = 'inventory-section';

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    handleInitialNavigation();
});

// Initialize dashboard
function initializeDashboard() {
    showSection('inventory-section');  // Show default section
    switchTab('site');                 // Set default tab
    initializeCharts();               // Init charts
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.querySelectorAll('.nav-link span').forEach(span => {
                span.classList.toggle('hidden');
            });
        });
    }

    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== 'index.html') {
                e.preventDefault();
                const sectionId = href.replace('#', '');
                showSection(sectionId);
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// Handle initial navigation based on URL hash
function handleInitialNavigation() {
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        showSection(sectionId);

        const navLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (navLink) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            navLink.classList.add('active');
        }
    }
}

// Section visibility management
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        currentSection = sectionId;

        if (sectionId === 'inventory-section') {
            initializeCharts();
        }

        const scrollPosition = window.scrollY;
        window.location.hash = sectionId;
        window.scrollTo(0, scrollPosition);
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Set active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show current tab content
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    currentTab = tabName;
    updateDashboardData(tabName);
}

// Update dashboard data based on selected tab
function updateDashboardData(tabName) {
    const data = getStoredData(tabName);
    if (!data) {
        resetDashboardData();
        return;
    }

    document.getElementById('total-stock').textContent = data.totalStock || '0';
    document.getElementById('current-balance').textContent = data.currentBalance || '0';
    document.getElementById('avg-age').textContent = data.averageAge || '0';

    updateCharts(data);
}

// Reset dashboard data to default values
function resetDashboardData() {
    document.getElementById('total-stock').textContent = '0';
    document.getElementById('current-balance').textContent = '0';
    document.getElementById('avg-age').textContent = '0';

    updateCharts({
        sbuData: { labels: [], values: [] },
        pbbData: { labels: [], values: [] },
        yearData: { labels: [], values: [] }
    });
}

// Get stored data for a specific tab
function getStoredData(tabName) {
    const storedData = localStorage.getItem(`wika-data-${tabName}`);
    return storedData ? JSON.parse(storedData) : null;
}

// Store processed data
function storeData(tabName, data) {
    localStorage.setItem(`wika-data-${tabName}`, JSON.stringify(data));
    if (currentTab === tabName && currentSection === 'inventory-section') {
        updateDashboardData(tabName);
    }
}

// Error handling
function showError(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'error-alert';
    errorAlert.textContent = message;
    document.body.appendChild(errorAlert);
    
    setTimeout(() => {
        errorAlert.remove();
    }, 3000);
}

// Success message
function showSuccess(message) {
    const successAlert = document.createElement('div');
    successAlert.className = 'success-alert';
    successAlert.textContent = message;
    document.body.appendChild(successAlert);
    
    setTimeout(() => {
        successAlert.remove();
    }, 3000);
}

// Handle hash-based navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        showSection(sectionId);
    }
});
