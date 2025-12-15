/**
 * Admin Panel - Core JavaScript
 * Handles common functionality across admin pages
 * @author Senior Frontend Developer - Pulih Project
 */

// API Base URL
const API_BASE = '/api/admin';

// ========================================
// Utility Functions
// ========================================

/**
 * Fetch wrapper with error handling
 */
async function adminFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Admin API Error:', error);
        showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        throw error;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const existingToast = document.getElementById('admin-toast');
    if (existingToast) existingToast.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = `fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-[slideUp_0.3s_ease-out]`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-xl">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Format date to Indonesian locale
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format relative time
 */
function formatRelativeTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
}

/**
 * Mask email for privacy
 */
function maskEmail(email) {
    if (!email) return 'Tidak ada';
    const [name, domain] = email.split('@');
    const maskedName = name.substring(0, 3) + '***';
    return `${maskedName}@${domain}`;
}

// ========================================
// Theme Toggle
// ========================================

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('admin-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
    });
}

// ========================================
// Sidebar Navigation
// ========================================

function initSidebar() {
    // Mobile sidebar toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay?.classList.toggle('open');
        });

        overlay?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // Highlight active link
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        } else if (href === 'index.html' && currentPath.endsWith('/admin/')) {
            link.classList.add('active');
        }
    });
}

// ========================================
// Authentication Check
// ========================================

/**
 * Get admin token from storage
 */
function getAdminToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

/**
 * Check if user is authenticated, redirect to login if not
 */
async function checkAuth() {
    const token = getAdminToken();

    if (!token) {
        window.location.href = 'login.html';
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!data.valid) {
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminToken');
            window.location.href = 'login.html';
            return false;
        }

        // Update admin name in sidebar if exists
        const adminNameEl = document.querySelector('.admin-name');
        if (adminNameEl && data.admin) {
            adminNameEl.textContent = data.admin.name;
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// ========================================
// Logout Handler
// ========================================

function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                const token = getAdminToken();

                try {
                    await fetch(`${API_BASE}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (e) {
                    console.error('Logout error:', e);
                }

                localStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminToken');
                window.location.href = 'login.html';
            }
        });
    }
}

// ========================================
// Initialize on DOM Ready
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Skip auth check on login page
    if (!window.location.pathname.includes('login.html')) {
        const isAuth = await checkAuth();
        if (!isAuth) return;
    }

    initThemeToggle();
    initSidebar();
    initLogout();
});

// Export for module usage
window.AdminUtils = {
    adminFetch,
    showToast,
    formatDate,
    formatRelativeTime,
    maskEmail,
    getAdminToken
};
