// Global state
let currentTab = 'ok';
let currentSection = 'inventory-section';

document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    setupEventListeners();
    handleInitialNavigation();
});

// 🚀 Setup awal dashboard
function initializeDashboard() {
    showSection('inventory-section');
    switchTab(currentTab);

    if (typeof initializeCharts === 'function') {
        initializeCharts();
    } else {
        console.warn("⚠️ initializeCharts() belum didefinisikan.");
    }

    if (typeof initializeDefaultCharts === 'function') {
        initializeDefaultCharts();
    } else {
        console.warn("⚠️ initializeDefaultCharts() belum didefinisikan.");
    }
}

// 🧠 Event listener: sidebar, tab, dll.
function setupEventListeners() {
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

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// 🌐 Navigasi berdasarkan #hash di URL
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

// 👁️ Tampilkan 1 section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        currentSection = sectionId;

        if (sectionId === 'inventory-section' && typeof initializeCharts === 'function') {
            initializeCharts();
        }

        const scrollPosition = window.scrollY;
        window.location.hash = sectionId;
        window.scrollTo(0, scrollPosition);
    }
}

// 🔄 Ganti tab (dalam 1 section)
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    currentTab = tabName;
    updateDashboardData(tabName);
}

// 📡 Update grafik dashboard berdasarkan tab
function updateDashboardData(tabName) {
    console.log("📡 updateDashboardData dipanggil untuk tab:", tabName);
    const data = getStoredData(tabName);

    if (!data || data.length === 0) {
        console.warn("⚠️ Tidak ada data untuk tab:", tabName);
        updateCharts(tabName, []); // Kosongkan grafik
        return;
    }

    updateCharts(tabName, data);
}

// 📦 Ambil data dari localStorage
function getStoredData(tabName) {
    const raw = localStorage.getItem(tabName); // konsisten dengan upload.js
    return raw ? JSON.parse(raw) : null;
}

// 💾 Simpan data ke localStorage
function storeData(tabName, data) {
    localStorage.setItem(tabName, JSON.stringify(data));

    if (typeof updateDashboardData === 'function') {
        if (currentTab === tabName && currentSection === 'inventory-section') {
            updateDashboardData(tabName);
        }
    }
}

// ✅ Global alert
function showError(message) {
    const div = document.createElement('div');
    div.className = 'error-alert';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success-alert';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// 🔁 Handle jika hash berubah manual
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        showSection(sectionId);
    }
});
