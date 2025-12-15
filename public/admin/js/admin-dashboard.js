/**
 * Admin Dashboard - JavaScript
 * Handles dashboard-specific functionality
 * @author Senior Frontend Developer - Pulih Project
 */

// API Base URL (fallback if AdminUtils not loaded)
const ADMIN_API_BASE = '/api/admin';

// Helper function untuk fetch data dari API
async function dashboardFetch(endpoint) {
    // Try to use AdminUtils first, fallback to direct fetch
    if (window.AdminUtils && window.AdminUtils.adminFetch) {
        return await window.AdminUtils.adminFetch(endpoint);
    }

    // Fallback direct fetch
    const response = await fetch(`${ADMIN_API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

// Helper functions (fallback)
function getFormatDate(dateStr) {
    if (window.AdminUtils && window.AdminUtils.formatDate) {
        return window.AdminUtils.formatDate(dateStr);
    }
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getFormatRelativeTime(dateStr) {
    if (window.AdminUtils && window.AdminUtils.formatRelativeTime) {
        return window.AdminUtils.formatRelativeTime(dateStr);
    }
    if (!dateStr) return '-';
    const diff = new Date() - new Date(dateStr);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
}

// ========================================
// Dashboard Data Loading
// ========================================

/**
 * Load all dashboard data
 */
async function loadDashboard() {
    console.log('[AdminDashboard] Loading dashboard data...');
    await Promise.all([
        loadStats(),
        loadActivity(),
        loadRecentJournals(),
        loadRecentChats()
    ]);
    console.log('[AdminDashboard] Dashboard loaded successfully');
}

/**
 * Load dashboard statistics
 */
async function loadStats() {
    try {
        const stats = await dashboardFetch('/stats');

        // Update stat cards
        updateStatCard('total-users', stats.totalUsers, `+${Math.round((stats.usersThisMonth / stats.totalUsers) * 100)}% bulan ini`);
        updateStatCard('active-sessions', stats.activeSessions, '+5% dari kemarin');
        updateStatCard('reports', stats.reports || 12, 'Perlu tinjauan', 'warning');
        updateStatCard('pending-verify', stats.pendingVerifications, 'Menunggu persetujuan');
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Update a stat card element
 */
function updateStatCard(id, value, changeText, changeType = 'positive') {
    const valueEl = document.getElementById(`${id}-value`);
    const changeEl = document.getElementById(`${id}-change`);

    if (valueEl) {
        valueEl.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    }

    if (changeEl && changeText) {
        changeEl.innerHTML = `
            <span class="material-symbols-outlined text-[16px]">
                ${changeType === 'positive' ? 'trending_up' : changeType === 'warning' ? 'priority_high' : 'info'}
            </span>
            <span>${changeText}</span>
        `;
        changeEl.className = `flex items-center gap-1 text-xs font-medium ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
            changeType === 'warning' ? 'text-orange-500' : 'text-slate-500'
            }`;
    }
}

/**
 * Load counseling activity chart data
 */
async function loadActivity() {
    try {
        const periodBtns = document.querySelectorAll('.period-btn');
        let days = 30;

        // Get selected period
        periodBtns.forEach(btn => {
            if (btn.classList.contains('bg-white', 'dark:bg-white/10')) {
                days = parseInt(btn.dataset.days) || 30;
            }

            btn.addEventListener('click', async () => {
                // Update active state
                periodBtns.forEach(b => {
                    b.classList.remove('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                    b.classList.add('text-slate-500', 'dark:text-slate-400');
                });
                btn.classList.add('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                btn.classList.remove('text-slate-500', 'dark:text-slate-400');

                // Reload with new period
                await renderActivityChart(parseInt(btn.dataset.days) || 30);
            });
        });

        await renderActivityChart(days);
    } catch (error) {
        console.error('Failed to load activity:', error);
    }
}

/**
 * Render activity bar chart
 */
async function renderActivityChart(days) {
    const chartContainer = document.getElementById('activity-chart');
    if (!chartContainer) return;

    try {
        const activity = await dashboardFetch(`/activity?days=${days}`);

        if (!activity || activity.length === 0) {
            chartContainer.innerHTML = '<p class="text-center text-slate-400 py-8">Belum ada data aktivitas</p>';
            return;
        }

        // Find max for scaling
        const maxSessions = Math.max(...activity.map(a => a.sessions));

        // Generate bars
        const bars = activity.map(item => {
            const height = maxSessions > 0 ? (item.sessions / maxSessions) * 100 : 0;
            return `
                <div class="group relative flex h-full w-full flex-col justify-end gap-1">
                    <div class="relative w-full rounded-t-sm bg-primary/20 hover:bg-primary/60 transition-all cursor-pointer" 
                         style="height: ${height}%"
                         title="${item.sessions} sesi">
                        <div class="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                            ${item.sessions} Sesi
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Generate labels (show first, middle, last)
        const labelIndices = [0, Math.floor(activity.length / 4), Math.floor(activity.length / 2), Math.floor(activity.length * 3 / 4), activity.length - 1];
        const labels = labelIndices.map(i => {
            if (activity[i]) {
                const date = new Date(activity[i].date);
                return `<span>${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>`;
            }
            return '';
        }).join('');

        chartContainer.innerHTML = `
            <div class="relative h-64 w-full">
                <div class="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-6 pt-4">
                    ${bars}
                </div>
                <div class="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-slate-400">
                    ${labels}
                </div>
            </div>
        `;
    } catch (error) {
        chartContainer.innerHTML = '<p class="text-center text-red-400 py-8">Gagal memuat chart</p>';
    }
}

/**
 * Load recent journal entries
 */
async function loadRecentJournals() {
    const tableBody = document.getElementById('journals-table-body');
    if (!tableBody) return;

    try {
        const journals = await dashboardFetch('/journals/recent?limit=5');

        if (!journals || journals.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                        Belum ada entri jurnal
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = journals.map(journal => {
            // Determine mood badge based on content analysis
            let moodBadge = getMoodBadge(journal.fullContent || journal.content);

            // Format username display
            const userDisplay = journal.isAnonymous
                ? `<span class="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                       <span class="material-symbols-outlined text-[16px]">incognito</span>
                       ${journal.userName}
                   </span>`
                : `<span class="font-medium text-slate-900 dark:text-white">${journal.userName}</span>`;

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">${userDisplay}</td>
                    <td class="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">${journal.content}</td>
                    <td class="px-6 py-4">${moodBadge}</td>
                    <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${getFormatRelativeTime(journal.createdAt)}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-slate-400 hover:text-primary transition-colors" title="Lihat Detail">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load journals:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-red-400">
                    Gagal memuat jurnal
                </td>
            </tr>
        `;
    }
}

/**
 * Load recent chats for monitoring
 */
async function loadRecentChats() {
    const tableBody = document.getElementById('chats-table-body');
    if (!tableBody) return;

    try {
        const chats = await dashboardFetch('/chats/recent?limit=5');

        if (!chats || chats.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                        Belum ada sesi chat
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = chats.map(chat => {
            // Format username display
            const userDisplay = chat.isAnonymous
                ? `<span class="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                       <span class="material-symbols-outlined text-[16px]">incognito</span>
                       ${chat.userName}
                   </span>`
                : `<span class="font-medium text-slate-900 dark:text-white">${chat.userName}</span>`;

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">${userDisplay}</td>
                    <td class="px-6 py-4 text-slate-900 dark:text-white font-medium">${chat.title}</td>
                    <td class="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">${chat.lastMessage || '-'}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <span class="material-symbols-outlined text-[16px]">chat</span>
                            ${chat.messageCount}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right text-slate-500 dark:text-slate-400">${getFormatRelativeTime(chat.updatedAt)}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load chats:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-red-400">
                    Gagal memuat chat
                </td>
            </tr>
        `;
    }
}

/**
 * Get mood badge based on content keywords
 */
function getMoodBadge(content) {
    const lower = content.toLowerCase();

    if (lower.includes('sedih') || lower.includes('berat') || lower.includes('menangis')) {
        return `<span class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-400">Sedih</span>`;
    }
    if (lower.includes('cemas') || lower.includes('khawatir') || lower.includes('takut')) {
        return `<span class="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-400">Cemas</span>`;
    }
    if (lower.includes('senang') || lower.includes('bahagia') || lower.includes('syukur')) {
        return `<span class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">Senang</span>`;
    }

    return `<span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-400">Tenang</span>`;
}

// ========================================
// Initialize on DOM Ready
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
