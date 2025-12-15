// Journal Logic
import { toggleModal, showToast } from './ui.js';
import { VoiceRecorder } from './VoiceRecorder.js';

let allJournalEntries = [];
let editingId = null; // Track ID for editing
let journalVoiceRecorder = null; // Voice Recorder instance for journal
const userId = JSON.parse(localStorage.getItem('user'))?.id;

export function setupJournaling() {
    // View Switching
    const btnWrite = document.getElementById('btn-write-journal');
    const btnBack = document.getElementById('btn-back-journal');
    const btnCancel = document.getElementById('btn-cancel-journal');
    const viewList = document.getElementById('journal-list-view');
    const viewWrite = document.getElementById('journal-write-view');
    const searchInput = document.getElementById('journal-search');

    const switchView = (toWrite, entryToEdit = null) => {
        if (toWrite) {
            viewList.classList.add('hidden');
            viewWrite.classList.remove('hidden');
            viewWrite.classList.add('flex');

            if (entryToEdit) {
                editingId = entryToEdit.id;
                document.getElementById('journal-content-new').value = entryToEdit.content;
                document.getElementById('journal-write-title').innerText = "Edit Jurnal";
                document.getElementById('journal-content-new').focus();
            } else {
                editingId = null;
                document.getElementById('journal-content-new').value = '';
                document.getElementById('journal-write-title').innerText = "Catatan Baru";
                document.getElementById('journal-content-new').focus();
            }

        } else {
            viewWrite.classList.add('hidden');
            viewWrite.classList.remove('flex');
            viewList.classList.remove('hidden');
            document.getElementById('journal-content-new').value = '';
            editingId = null;
        }
    };

    if (btnWrite) btnWrite.addEventListener('click', () => switchView(true));
    if (btnBack) btnBack.addEventListener('click', () => switchView(false));
    if (btnCancel) btnCancel.addEventListener('click', () => switchView(false));

    // Initialize Voice Recorder for Journal (Voice-to-Text)
    const journalVoiceBtn = document.getElementById('btn-journal-voice');
    const journalTextarea = document.getElementById('journal-content-new');
    if (journalVoiceBtn && journalTextarea) {
        journalVoiceRecorder = new VoiceRecorder('#btn-journal-voice', '#journal-content-new', {
            lang: 'id-ID',
            continuous: true,
            interimResults: true
        });
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allJournalEntries.filter(entry =>
                entry.content.toLowerCase().includes(query) ||
                (entry.aiFeedback && entry.aiFeedback.toLowerCase().includes(query))
            );
            renderJournalEntries(filtered, switchView);
        });
    }

    // Save Logic
    const btnSave = document.getElementById('btn-save-journal-new');
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const content = document.getElementById('journal-content-new').value;
            if (!content.trim()) return showToast('Tulis sesuatu dulu ya!', 'error');

            btnSave.innerText = "Menyimpan...";
            btnSave.disabled = true;

            try {
                // Determine URL and Method
                const url = editingId ? `/api/journal/${editingId}` : '/api/journal/analyze';
                const method = editingId ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, content })
                });

                if (res.status === 401) {
                    showToast('Sesi habis, silakan login ulang', 'error');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                    return;
                }

                showToast('Jurnal berhasil disimpan', 'success');

                switchView(false);
                loadJournalList();

                // Dispatch Event
                window.dispatchEvent(new CustomEvent('journalUpdated', {
                    detail: { content: content }
                }));

            } catch (e) {
                showToast('Error menyimpan jurnal', 'error');
                console.error(e);
            } finally {
                btnSave.innerText = "Simpan";
                btnSave.disabled = false;
            }
        });
    }

    // Hook into modal open
    window.addEventListener('modalOpened', (e) => {
        if (e.detail.id === 'journal-modal') loadJournalList(switchView);
    });
}

async function loadJournalList(switchViewFn) {
    const container = document.getElementById('journal-entries-container');
    if (!container || !userId) return;

    container.innerHTML = `<div class="flex flex-col items-center justify-center h-40 text-gray-400"><span class="material-symbols-outlined text-4xl mb-2 animate-spin">progress_activity</span><p class="text-xs">Memuat...</p></div>`;

    try {
        const res = await fetch(`/api/journal/history?userId=${userId}`);
        const entries = await res.json();

        allJournalEntries = entries;
        renderJournalEntries(entries, switchViewFn);
    } catch (e) {
        container.innerHTML = `<p class="text-center text-red-400 text-sm mt-10">Gagal memuat jurnal.</p>`;
    }
}

function renderJournalEntries(entries, switchViewFn) {
    const container = document.getElementById('journal-entries-container');
    const countLabel = document.getElementById('journal-count');
    if (!container) return;

    container.innerHTML = '';
    if (countLabel) countLabel.innerText = `Menampilkan ${entries.length} entri`;

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
                <span class="material-symbols-outlined text-6xl mb-4 text-gray-300 dark:text-gray-700">book_4</span>
                <p class="text-sm font-medium">Jurnal kamu masih kosong</p>
                <p class="text-xs mt-1">Mulai tulis ceritamu hari ini.</p>
            </div>
        `;
        return;
    }

    entries.forEach(entry => {
        const dateObj = new Date(entry.createdAt);
        const dateStr = dateObj.getDate().toString();
        const monthStr = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const card = document.createElement('div');
        card.className = "group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all cursor-pointer animate-[fadeIn_0.3s_ease-out] relative";

        // Edit Button (Visible on hover)
        const editBtn = document.createElement('button');
        editBtn.className = "absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-2 z-10";
        editBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">edit_note</span>';
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent card click
            // We need to access switchView here. 
            // Ideally switchView should be passed or accessible.
            // Passed via arg.
            if (switchViewFn) switchViewFn(true, entry);
        };

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30">
                        <span class="text-[10px] font-bold tracking-wider">${monthStr}</span>
                        <span class="text-lg font-bold leading-none">${dateStr}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">Catatan Harian</h3>
                        <p class="text-xs text-text-muted dark:text-gray-400 mt-0.5">${timeStr} WIB • Jurnal Pribadi</p>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-3 font-body">
                ${entry.content}
            </p>
            ${entry.aiFeedback ? `
            <div class="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50">
                 <p class="text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1.5 font-medium">
                    <span class="material-symbols-outlined text-[14px]">psychology</span>
                    Insight: <span class="text-gray-500 dark:text-gray-400 font-normal italic truncate max-w-[200px]">${entry.aiFeedback}</span>
                 </p>
            </div>
            ` : ''}
        `;
        card.appendChild(editBtn); // Append button
        container.appendChild(card);
    });
}
