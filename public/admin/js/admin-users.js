/**
 * Admin Users Management - JavaScript
 * Handles user management functionality
 * @author Senior Frontend Developer - Pulih Project
 */

// API Base URL
const USERS_API_BASE = '/api/admin';

// Helper function untuk fetch data dari API
async function usersFetch(endpoint, options = {}) {
    if (window.AdminUtils && window.AdminUtils.adminFetch) {
        return await window.AdminUtils.adminFetch(endpoint);
    }
    const response = await fetch(`${USERS_API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

// Helper functions (fallback)
function usersShowToast(message, type = 'info') {
    if (window.AdminUtils && window.AdminUtils.showToast) {
        return window.AdminUtils.showToast(message, type);
    }
    alert(message);
}

function usersFormatDate(dateStr) {
    if (window.AdminUtils && window.AdminUtils.formatDate) {
        return window.AdminUtils.formatDate(dateStr);
    }
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function usersMaskEmail(email) {
    if (window.AdminUtils && window.AdminUtils.maskEmail) {
        return window.AdminUtils.maskEmail(email);
    }
    if (!email) return 'Tidak ada';
    const [name, domain] = email.split('@');
    return `${name.substring(0, 3)}***@${domain}`;
}

// State
let currentPage = 1;
let currentSearch = '';
let currentType = 'all';
let currentStatus = 'all';

// ========================================
// User Data Loading
// ========================================

/**
 * Load users with current filters
 */
async function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3 text-slate-400">
                    <span class="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                    <span>Memuat data pengguna...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            search: currentSearch,
            type: currentType,
            status: currentStatus
        });

        const data = await usersFetch(`/users?${params}`);

        if (!data.users || data.users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                        Tidak ada pengguna ditemukan
                    </td>
                </tr>
            `;
            updatePagination(data.pagination);
            return;
        }

        renderUsersTable(data.users);
        updatePagination(data.pagination);
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-red-400">
                    Gagal memuat data pengguna
                </td>
            </tr>
        `;
    }
}

/**
 * Render users table rows
 */
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = users.map(user => {
        const isAnonymous = user.isAnonymous;
        const userId = isAnonymous ? `ANO-${user.id.slice(-8)}` : `USR-${user.id.slice(-8)}`;

        // Avatar - gunakan inisial, bukan icon incognito
        const avatar = isAnonymous
            ? `<div class="bg-indigo-100 dark:bg-indigo-900/30 rounded-full size-10 shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                   A
               </div>`
            : `<div class="bg-gradient-to-br from-primary/20 to-emerald-200 rounded-full size-10 shrink-0 flex items-center justify-center text-primary-dark font-bold text-sm">
                   ${(user.fullName || 'U').charAt(0).toUpperCase()}
               </div>`;

        // Type badge
        const typeBadge = isAnonymous
            ? `<span class="badge badge-purple">Anonim</span>`
            : `<span class="badge badge-info">Terdaftar</span>`;

        // Status badge (simplified - active by default)
        const statusBadge = `
            <span class="badge badge-success">
                <span class="size-1.5 rounded-full bg-green-500"></span>
                Aktif
            </span>
        `;

        // Contact info
        const contact = isAnonymous
            ? `<p class="text-sm text-slate-400 italic">Disembunyikan</p>`
            : `<p class="text-sm text-slate-600 dark:text-slate-300">${usersMaskEmail(user.email)}</p>
               ${user.email ? '<p class="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-[12px]">verified</span> Terverifikasi</p>' : ''}`;

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group" data-user-id="${user.id}">
                <td class="py-4 px-6">
                    <input type="checkbox" class="user-checkbox rounded border-slate-300 text-primary focus:ring-primary bg-transparent" value="${user.id}" />
                </td>
                <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                        ${avatar}
                        <div>
                            <p class="font-medium text-slate-900 dark:text-white">${isAnonymous ? `Anonim_${user.id.slice(-4)}` : user.fullName}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">ID: #${userId}</p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">${contact}</td>
                <td class="py-4 px-6">${typeBadge}</td>
                <td class="py-4 px-6">
                    <p class="text-sm text-slate-600 dark:text-slate-300">${usersFormatDate(user.joinedDate)}</p>
                </td>
                <td class="py-4 px-6">${statusBadge}</td>
                <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="viewUser('${user.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Lihat Detail">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button onclick="editUser('${user.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors" title="Edit Data">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onclick="showUserMenu('${user.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <span class="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update pagination UI
 */
function updatePagination(pagination) {
    const paginationInfo = document.getElementById('pagination-info');
    const paginationButtons = document.getElementById('pagination-buttons');

    if (paginationInfo) {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        paginationInfo.innerHTML = `
            Menampilkan <span class="font-medium text-slate-900 dark:text-white">${start}</span> 
            sampai <span class="font-medium text-slate-900 dark:text-white">${end}</span> 
            dari <span class="font-medium text-slate-900 dark:text-white">${pagination.total}</span> pengguna
        `;
    }

    if (paginationButtons) {
        const { page, totalPages } = pagination;
        let buttons = '';

        // Previous button
        buttons += `
            <button onclick="goToPage(${page - 1})" 
                    class="px-3 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 transition-colors ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${page <= 1 ? 'disabled' : ''}>
                Sebelumnya
            </button>
        `;

        // Page numbers
        buttons += '<div class="flex gap-1">';
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            if (i === page) {
                buttons += `<button class="px-3 py-1 text-sm rounded-lg bg-primary text-slate-900 font-medium">${i}</button>`;
            } else {
                buttons += `<button onclick="goToPage(${i})" class="px-3 py-1 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">${i}</button>`;
            }
        }
        if (totalPages > 5) {
            buttons += `<span class="px-2 py-1 text-slate-400">...</span>`;
            buttons += `<button onclick="goToPage(${totalPages})" class="px-3 py-1 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">${totalPages}</button>`;
        }
        buttons += '</div>';

        // Next button
        buttons += `
            <button onclick="goToPage(${page + 1})" 
                    class="px-3 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 transition-colors ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${page >= totalPages ? 'disabled' : ''}>
                Berikutnya
            </button>
        `;

        paginationButtons.innerHTML = buttons;
    }
}

// ========================================
// User Actions
// ========================================

/**
 * Go to specific page
 */
function goToPage(page) {
    if (page < 1) return;
    currentPage = page;
    loadUsers();
}

/**
 * View user details with modal
 */
async function viewUser(userId) {
    try {
        // Fetch user details and chats
        const user = await usersFetch(`/users/${userId}`);
        const chats = await usersFetch(`/users/${userId}/chats`);

        // Create and show modal
        showUserDetailModal(user, chats);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        usersShowToast('Gagal memuat detail pengguna', 'error');
    }
}

/**
 * Show user detail modal
 */
function showUserDetailModal(user, chats) {
    // Remove existing modal
    const existing = document.getElementById('user-detail-modal');
    if (existing) existing.remove();

    // Format user display name
    const displayName = user.isAnonymous
        ? (user.username ? `@${user.username}` : `Anonim_${user.id.slice(-4)}`)
        : (user.fullName || user.username || 'User');

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'user-detail-modal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-4">
                    <div class="${user.isAnonymous ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gradient-to-br from-primary/20 to-emerald-200 text-primary-dark'} rounded-full size-14 flex items-center justify-center font-bold text-lg">
                        ${user.isAnonymous ? '<span class="material-symbols-outlined text-2xl">incognito</span>' : displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">${displayName}</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400">ID: ${user.id.slice(0, 8)}...</p>
                    </div>
                </div>
                <button onclick="closeUserModal()" class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <!-- User Info -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Tipe Akun</p>
                        <p class="font-medium text-slate-900 dark:text-white">${user.isAnonymous ? 'Anonim' : 'Terdaftar'}</p>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Tanggal Gabung</p>
                        <p class="font-medium text-slate-900 dark:text-white">${usersFormatDate(user.joinedDate)}</p>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Streak</p>
                        <p class="font-medium text-slate-900 dark:text-white">${user.streak || 0} hari</p>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sesi Chat</p>
                        <p class="font-medium text-slate-900 dark:text-white">${chats.length} sesi</p>
                    </div>
                </div>
                
                <!-- Chat History -->
                <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 class="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">chat</span>
                        Riwayat Chat
                    </h4>
                    ${chats.length > 0 ? `
                        <div class="space-y-2">
                            ${chats.slice(0, 5).map(chat => `
                                <div class="p-3 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer" onclick="viewChatDetail('${chat.id}')">
                                    <div class="flex items-center justify-between">
                                        <p class="font-medium text-slate-900 dark:text-white text-sm">${chat.title}</p>
                                        <span class="text-xs text-slate-500 dark:text-slate-400">${chat.messageCount} pesan</span>
                                    </div>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${usersFormatDate(chat.updatedAt)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-sm text-slate-400">Belum ada riwayat chat</p>'}
                </div>
            </div>
            
            <!-- Footer -->
            <div class="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-white/5">
                <button onclick="closeUserModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-white/10 transition-colors">
                    Tutup
                </button>
                <button onclick="deleteUser('${user.id}')" class="px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                    Hapus User
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeUserModal();
    });
}

/**
 * Close user detail modal
 */
function closeUserModal() {
    const modal = document.getElementById('user-detail-modal');
    if (modal) modal.remove();
}

/**
 * View chat detail - full chat viewer modal
 */
async function viewChatDetail(chatId) {
    try {
        const chat = await usersFetch(`/chats/${chatId}`);
        showChatViewerModal(chat);
    } catch (error) {
        console.error('Failed to fetch chat:', error);
        usersShowToast('Gagal memuat detail chat', 'error');
    }
}

/**
 * Show full chat viewer modal
 */
function showChatViewerModal(chat) {
    // Remove existing modal
    const existing = document.getElementById('chat-viewer-modal');
    if (existing) existing.remove();

    // Format messages
    const messages = chat.messages || [];

    const messagesHtml = messages.length > 0
        ? messages.map(msg => {
            const isUser = msg.role === 'user';
            return `
                <div class="flex ${isUser ? 'justify-end' : 'justify-start'} mb-3">
                    <div class="${isUser
                    ? 'bg-primary/20 text-slate-900 dark:text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200'} 
                        rounded-2xl px-4 py-3 max-w-[80%] ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}">
                        <p class="text-sm whitespace-pre-wrap">${msg.content}</p>
                        ${msg.timestamp ? `<p class="text-[10px] mt-1 opacity-60">${new Date(msg.timestamp).toLocaleString('id-ID')}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-center text-slate-400 py-8">Tidak ada pesan</p>';

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'chat-viewer-modal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="bg-primary/20 rounded-full p-2">
                        <span class="material-symbols-outlined text-primary">chat</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900 dark:text-white">${chat.title || 'Sesi Chat'}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            ${chat.userName || 'User'} • ${messages.length} pesan
                        </p>
                    </div>
                </div>
                <button onclick="closeChatViewer()" class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-black/20" style="max-height: 60vh;">
                ${messagesHtml}
            </div>
            
            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shrink-0">
                <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Dibuat: ${usersFormatDate(chat.createdAt)}</span>
                    <span>Update: ${usersFormatDate(chat.updatedAt)}</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeChatViewer();
    });
}

/**
 * Close chat viewer modal
 */
function closeChatViewer() {
    const modal = document.getElementById('chat-viewer-modal');
    if (modal) modal.remove();
}

/**
 * Edit user (placeholder)
 */
function editUser(userId) {
    usersShowToast('Fitur edit akan segera tersedia', 'info');
}

/**
 * Show user context menu
 */
function showUserMenu(userId) {
    viewUser(userId);
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait akan dihapus.')) {
        return;
    }

    try {
        await usersFetch(`/users/${userId}`, { method: 'DELETE' });
        usersShowToast('Pengguna berhasil dihapus', 'success');
        loadUsers();
    } catch (error) {
        usersShowToast('Gagal menghapus pengguna', 'error');
    }
}

// ========================================
// Search & Filters
// ========================================

function initSearchAndFilters() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadUsers();
            }, 300);
        });
    }

    // Type filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            currentType = e.target.value;
            currentPage = 1;
            loadUsers();
        });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentStatus = e.target.value;
            currentPage = 1;
            loadUsers();
        });
    }
}

// ========================================
// Initialize on DOM Ready
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    initSearchAndFilters();
});

// Export functions for inline event handlers
window.goToPage = goToPage;
window.viewUser = viewUser;
window.editUser = editUser;
window.showUserMenu = showUserMenu;
window.deleteUser = deleteUser;
window.closeUserModal = closeUserModal;
window.viewChatDetail = viewChatDetail;
window.closeChatViewer = closeChatViewer;
