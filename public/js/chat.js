import { fetchChatHistory, saveSessionToBackend, fetchSuggestions, initiateChatStream } from './services/chat-service.js';
import { initDashboard } from './dashboard.js';
import { VoiceRecorder } from './modules/VoiceRecorder.js';

const chatStream = document.getElementById('chat-stream');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const historyContainer = document.getElementById('history-container');
const logoutBtn = document.getElementById('logout-btn');

// Constants
const CRISIS_KEYWORDS = ["bunuh diri", "ingin mati", "lukai diri", "tidak kuat lagi", "akhiri hidup", "gantung diri", "minum racun"];

let currentUser = JSON.parse(localStorage.getItem('user'));
let messageHistory = [];
let currentSessionId = null;
let voiceRecorder = null; // Voice Recorder instance

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    init();
}

function init() {
    setupSidebar();
    loadHistory();
    setupEventListeners();
    initDashboard(); // Initialize Dashboard features

    // Initialize Voice Recorder (Voice-to-Text)
    voiceRecorder = new VoiceRecorder('#btn-voice', '#chat-input', {
        lang: 'id-ID',
        continuous: true,
        interimResults: true
    });
}

function setupSidebar() {
    document.getElementById('user-name-sidebar').textContent = currentUser.fullName;
    document.getElementById('user-status-sidebar').textContent = "Member";
    document.getElementById('user-avatar-sidebar').style.backgroundImage = `url("https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=random")`;
}

function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);

    // Desktop New Chat
    document.getElementById('btn-new-chat').addEventListener('click', startNewChat);

    // Utilities
    document.getElementById('btn-toggle-blur')?.addEventListener('click', () => {
        document.body.classList.toggle('blur-mode-active');
        const btn = document.getElementById('btn-toggle-blur');
        btn.querySelector('span').innerText = document.body.classList.contains('blur-mode-active') ? 'visibility' : 'visibility_off';
    });

    const exportHandler = () => {
        const content = messageHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-pulih-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    };
    document.getElementById('btn-export-chat')?.addEventListener('click', exportHandler);
    document.getElementById('mobile-export-chat')?.addEventListener('click', exportHandler);

    document.getElementById('btn-end-session')?.addEventListener('click', async () => {
        if (!currentSessionId) return alert('Belum ada sesi aktif.');
        if (!confirm('Akhiri sesi dan buat ringkasan?')) return;

        try {
            const res = await fetch('/api/chat/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSessionId })
            });
            const data = await res.json();
            appendMessage(`**Ringkasan Sesi:**\n\n${data.summary}`, 'bot');
        } catch (e) { alert('Gagal membuat ringkasan'); }
    });

    // Emergency Modal
    document.getElementById('btn-curhat-emergency')?.addEventListener('click', () => {
        document.getElementById('emergency-modal').classList.add('hidden');
        document.getElementById('emergency-modal').classList.remove('flex');
    });

    // Mobile Sidebar Logic
    const mobileSidebarBtn = document.getElementById('mobile-sidebar-btn');
    const sidebar = document.getElementById('chat-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');

    function toggleSidebar(show) {
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
        } else {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('opacity-0');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
        }
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    }

    // Mobile hamburger button to open sidebar
    if (mobileSidebarBtn) {
        mobileSidebarBtn.addEventListener('click', () => toggleSidebar(true));
    }


    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });
}

function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function startNewChat() {
    currentSessionId = null;
    messageHistory = [];
    chatStream.innerHTML = '';
    // Optional: Close mobile menu if open
    const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
    if (mobileMenuDropdown && !mobileMenuDropdown.classList.contains('hidden')) {
        mobileMenuDropdown.classList.add('hidden');
    }

    appendMessage("Halo, saya di sini untuk mendengarkan. Bagaimana perasaanmu hari ini? Apakah ada sesuatu yang mengganggu pikiranmu?", 'bot');
}

async function loadHistory() {
    if (currentUser.isAnonymous) {
        historyContainer.innerHTML = '<p class="text-[10px] text-center text-gray-400 mb-4">Mode Anonim Aktif</p>';
    } else {
        historyContainer.innerHTML = '';
    }

    try {
        const chats = await fetchChatHistory(currentUser.id);
        renderHistoryList(chats);
    } catch (e) {
        console.error("Failed to load history", e);
    }
}

function renderHistoryList(chats) {
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col gap-2";
    wrapper.innerHTML = `<h3 class="px-4 text-xs font-bold text-text-muted uppercase tracking-wider dark:text-gray-400 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
            Riwayat Sesi
        </h3>`;

    if (chats.length === 0) {
        wrapper.innerHTML += `<p class="px-4 text-xs text-text-muted italic">Belum ada riwayat.</p>`;
    }

    const iconList = ['psychology', 'spa', 'local_florist', 'favorite', 'wb_sunny', 'diamond', 'star', 'filter_vintage', 'energy_savings_leaf', 'nightlight', 'water_drop', 'forest'];

    chats.forEach(chat => {
        const iconIndex = chat.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % iconList.length;
        const randomIcon = iconList[iconIndex];

        const item = document.createElement('a');
        item.className = "relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-50/80 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer";
        item.innerHTML = `
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl group-hover:h-full transition-all"></div>
                <div class="size-8 rounded-full bg-white dark:bg-green-800 flex items-center justify-center text-primary-dark dark:text-primary shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">${randomIcon}</span>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-semibold text-text-main dark:text-white truncate group-hover:text-primary-dark transition-colors">${chat.title}</span>
                    <span class="text-[11px] text-text-muted dark:text-gray-400 truncate">${new Date(chat.updatedAt).toLocaleDateString()}</span>
                </div>
            `;
        item.onclick = () => loadSession(chat);
        wrapper.appendChild(item);
    });

    historyContainer.appendChild(wrapper);
}

function loadSession(session) {
    currentSessionId = session.id;
    messageHistory = [];
    chatStream.innerHTML = '';

    // Close sidebar on mobile if open
    const sidebar = document.getElementById('chat-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('opacity-0');
        setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
    }

    session.messages.forEach(msg => {
        if (msg.role === 'system') return;
        appendMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
        messageHistory.push({ role: msg.role, content: msg.content });
    });
}

function checkCrisis(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return CRISIS_KEYWORDS.some(k => lower.includes(k));
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (checkCrisis(text)) {
        const modal = document.getElementById('emergency-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Do not return; allow the AI to respond as per new requirements
    }

    appendMessage(text, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.focus();

    const botMsgDiv = appendMessage('', 'bot', true); // Show loading
    const contentDiv = botMsgDiv.querySelector('.markdown-content');

    let fullReply = "";

    try {
        const response = await initiateChatStream(text, messageHistory, currentUser.id, currentSessionId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (buffer.trim()) {
                    const lines = buffer.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data:')) {
                            const dataStr = trimmed.replace('data:', '').trim();
                            if (dataStr !== '[DONE]') {
                                try {
                                    const json = JSON.parse(dataStr);
                                    if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                                        fullReply += json.choices[0].delta.content;
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                }
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('data:')) {
                    const dataStr = trimmed.replace('data:', '').trim();
                    if (dataStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(dataStr);
                        if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                            const content = json.choices[0].delta.content;
                            fullReply += content;

                            // Safe Marked Parse
                            const parsed = (typeof marked !== 'undefined')
                                ? marked.parse(fullReply)
                                : fullReply.replace(/\n/g, '<br>');

                            contentDiv.innerHTML = parsed;
                            scrollToBottom();
                        }
                    } catch (e) { }
                }
            }
        }

        const finalParsed = (typeof marked !== 'undefined')
            ? marked.parse(fullReply)
            : fullReply.replace(/\n/g, '<br>');
        contentDiv.innerHTML = finalParsed;

        messageHistory.push({ role: "user", content: text });
        messageHistory.push({ role: "assistant", content: fullReply });

        const sessionRes = await saveSessionToBackend(currentUser.id, currentSessionId, undefined, messageHistory);
        if (!currentSessionId) {
            currentSessionId = sessionRes.id;
            // Only reload history if it was a new session to update the list
            loadHistory();
        }

        const suggestData = await fetchSuggestions(messageHistory);
        if (suggestData.suggestions && suggestData.suggestions.length > 0) {
            renderSuggestions(suggestData.suggestions);
        }

    } catch (e) {
        console.error("Chat error", e);
        contentDiv.innerHTML += `\n\n[Error: ${e.message || 'Unknown Error'}]`;
    }
}

// --- Event Listeners for Dashboard Integration ---
window.addEventListener('moodUpdated', (e) => {
    const { level, note } = e.detail;
    // Hide modal
    document.getElementById('mood-modal')?.classList.add('hidden');
    document.getElementById('mood-modal')?.classList.remove('flex');

    // Trigger AI response (Simulate User context update)
    const prompt = `[SYSTEM UPDATE: User recorded Mood Level ${level}/5 (Scale: 1 = Sangat Sedih/Buruk, 5 = Sangat Senang/Baik). Note: "${note}". Respond accordingly.]`;

    // UI: Show small indicator
    const historyContainer = document.getElementById('history-container');
    const notice = document.createElement('div');
    notice.className = "flex justify-center my-2 text-xs text-gray-400 italic";
    notice.innerText = "Mood diperbarui...";
    historyContainer.appendChild(notice);

    // Call AI
    initiateAutoChat(prompt);
});

window.addEventListener('journalUpdated', (e) => {
    const { content } = e.detail;
    // Hide modal or keep open? User might want to read feedback.
    // Just notify AI for NEXT context.
    console.log("Journal updated, context available.");
});

async function initiateAutoChat(prompt) {
    const botMsgDiv = appendMessage('', 'bot', true);
    const contentDiv = botMsgDiv.querySelector('.markdown-content');

    try {
        const response = await initiateChatStream(prompt, messageHistory, currentUser.id, currentSessionId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullReply = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                // Process remaining buffer
                if (buffer.trim()) {
                    const lines = buffer.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data:')) {
                            const dataStr = trimmed.replace('data:', '').trim();
                            if (dataStr !== '[DONE]') {
                                try {
                                    const json = JSON.parse(dataStr);
                                    if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                                        fullReply += json.choices[0].delta.content;
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                }
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data:')) {
                    const dataStr = trimmed.replace('data:', '').trim();
                    if (dataStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(dataStr);
                        if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                            const content = json.choices[0].delta.content;
                            fullReply += content;

                            // Safe Marked Parse
                            const parsed = (typeof marked !== 'undefined')
                                ? marked.parse(fullReply)
                                : fullReply.replace(/\n/g, '<br>');

                            contentDiv.innerHTML = parsed;
                            scrollToBottom();
                        }
                    } catch (e) { console.error("Stream parse error", e); }
                }
            }
        }

        // Final safe parse
        const finalParsed = (typeof marked !== 'undefined')
            ? marked.parse(fullReply)
            : fullReply.replace(/\n/g, '<br>');
        contentDiv.innerHTML = finalParsed;

        // Add to history so AI remembers the reaction
        messageHistory.push({ role: "assistant", content: fullReply });

    } catch (e) {
        console.error("Auto chat error", e);
        contentDiv.innerHTML = "Error generating response.";
    }
}

function renderSuggestions(suggestions) {
    const div = document.createElement('div');
    div.className = "flex flex-wrap gap-2 mt-3 ml-1 animate-fade-in-up max-w-[85%]";

    suggestions.forEach(text => {
        const btn = document.createElement('button');
        btn.className = "px-4 py-2.5 bg-white dark:bg-surface-dark border border-green-200 dark:border-green-800 text-text-main dark:text-white rounded-xl text-sm font-medium hover:bg-green-50 hover:border-primary/50 hover:text-primary-dark transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5";
        btn.innerText = text;

        btn.onclick = () => {
            chatInput.value = text;
            chatInput.style.height = 'auto';
            sendMessage();
            div.remove();
        };
        div.appendChild(btn);
    });

    chatStream.appendChild(div);
    scrollToBottom();
}

function appendMessage(text, sender, returnElement = false) {
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sender === 'user') {
        div.className = "flex flex-col items-end gap-1 ml-auto max-w-[85%] animate-fade-in-up";
        div.innerHTML = `
            <div class="bg-gradient-to-br from-green-600 to-green-700 p-5 chat-bubble-user shadow-lg shadow-green-600/20 text-white leading-relaxed relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                <p class="font-body relative z-10 font-medium break-words">${text}</p>
            </div>
            <div class="flex items-center gap-1 mr-1">
                <span class="material-symbols-outlined text-[14px] text-primary">done_all</span>
                <span class="text-[10px] text-gray-400 font-medium">${time}</span>
            </div>
        `;
    } else {
        div.className = "flex items-end gap-3 max-w-[85%] animate-fade-in-up";
        div.innerHTML = `
            <div class="size-10 rounded-2xl bg-cover bg-center shrink-0 self-start shadow-md ring-2 ring-white dark:ring-surface-dark" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfYuKushqo8EGjLsG0JTRzX-D2FYOvAY2HF-XOPWix2HlCppSE5L6R_94X7XqIXab9GVh2KD2X5c9A8yrhfcCwpaI4a40alPH2JNqe4oXR89jeSBW39lVw7eTrKxFTvnhiLrzAUDhWisprXcGB8NMTTwwBdjNl1mza4CoODQNDnlXEaqFDjmAv3C4LmI1rQVkL8fsq0m4TctJAsQs7wYO1zRTOL2y7BsKJ8Lj0-X2w-6sznASXvKg1vU4AXQYBZ1kjceEslHm7t26J");'></div>
            <div class="flex flex-col gap-1 w-full min-w-0">
                <span class="text-xs font-semibold text-text-muted ml-1 dark:text-green-400 mb-1">Konselor Pulih</span>
                <div class="bg-soft-gradient dark:bg-none bg-white dark:bg-surface-dark p-5 chat-bubble-bot shadow-sm text-text-main dark:text-gray-100 leading-relaxed border border-green-50 dark:border-green-900 relative">
                    <span class="material-symbols-outlined absolute right-2 top-2 text-green-50 dark:text-green-900 text-4xl -z-0 opacity-50 rotate-12">spa</span>
                    <div class="font-body relative z-10 markdown-content break-words">
                        ${text ? marked.parse(text) : '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>'}
                    </div>
                </div>
            </div>
        `;
    }

    chatStream.appendChild(div);
    scrollToBottom();
    if (returnElement) return div;
}

function scrollToBottom() {
    chatStream.scrollTop = chatStream.scrollHeight;
}
