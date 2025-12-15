// Dashboard Aggregator
import { setupUI } from './modules/ui.js';
import { setupMoodTracker, loadMoodHistory } from './modules/mood.js';
import { setupJournaling } from './modules/journal.js';
import { setupBreathing } from './modules/breathing.js';
import { initAffirmations } from './modules/affirmations.js';
import { initAchievements, checkAchievements } from './modules/achievements.js';
import { setupGrounding } from './modules/grounding.js';
import { setupAssessment } from './modules/assessment.js';
import { setupSafetyPlan } from './modules/safetyplan.js';
import { setupProgress } from './modules/progress.js';

export function initDashboard() {
    console.log("Initializing Dashboard Modules...");

    // UI Setup (Modals, etc)
    setupUI();

    // Existing Features
    setupMoodTracker();
    loadMoodHistory(); // Load weekly mood bars on page load
    setupJournaling();
    setupBreathing();

    // New: Affirmations (modular)
    initAffirmations();

    // New: Achievements system
    initAchievements();

    // New: Grounding Exercise
    setupGrounding();

    // New: Self-Assessment (PHQ-9, GAD-7)
    setupAssessment();

    // New: Safety Plan Builder
    setupSafetyPlan();

    // New: Progress Dashboard
    setupProgress();

    // Setup Tools Buttons (connecting sidebar buttons to UI toggleModal)
    attachSidebarListeners();

    // Display streak
    displayStreak();

    // Listen for achievement triggers
    setupAchievementListeners();
}

function attachSidebarListeners() {
    const attach = (btnId, modalId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                import('./modules/ui.js').then(({ toggleModal }) => {
                    toggleModal(modalId, true);
                });
                // Close sidebar on mobile after selecting
                closeSidebarOnMobile();
            });
        }
    };

    // Sidebar buttons (same for desktop and mobile since we use one sidebar now)
    attach('btn-mood', 'mood-modal');
    attach('btn-journal', 'journal-modal');
    attach('btn-breathing', 'breathing-modal');
    attach('btn-grounding', 'grounding-modal');
    attach('btn-assessment', 'assessment-modal');
    attach('btn-progress', 'progress-modal');
    attach('btn-safety-plan', 'safetyplan-modal');
}

// Helper to close sidebar on mobile after selecting a menu item
function closeSidebarOnMobile() {
    const sidebar = document.getElementById('chat-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Only close if on mobile (sidebar is fixed positioned)
    if (sidebar && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        if (sidebarOverlay) {
            sidebarOverlay.classList.add('opacity-0');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
        }
    }
}

// Display streak counter
async function displayStreak() {
    const streakContainer = document.getElementById('streak-counter');
    if (!streakContainer) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const res = await fetch(`/api/profile?userId=${user.id}`);
        if (res.ok) {
            const data = await res.json();
            const streak = data.streak || 0;
            streakContainer.innerHTML = `<span class="font-bold">${streak}</span>`;
            streakContainer.title = `${streak} hari berturut-turut`;

            // Check streak achievements
            checkAchievements('login_streak', streak);
        }
    } catch (e) {
        console.error("Streak display error:", e);
    }
}

// Listen for various events to trigger achievements
function setupAchievementListeners() {
    // Mood logged
    window.addEventListener('moodUpdated', async () => {
        const moodCount = parseInt(localStorage.getItem('mood_count') || '0') + 1;
        localStorage.setItem('mood_count', moodCount.toString());
        checkAchievements('mood_count', moodCount);
    });

    // Journal written
    window.addEventListener('journalUpdated', async () => {
        const journalCount = parseInt(localStorage.getItem('journal_count') || '0') + 1;
        localStorage.setItem('journal_count', journalCount.toString());
        checkAchievements('journal_count', journalCount);
    });

    // Breathing completed
    window.addEventListener('breathingCompleted', async () => {
        const breathingCount = parseInt(localStorage.getItem('breathing_count') || '0') + 1;
        localStorage.setItem('breathing_count', breathingCount.toString());
        checkAchievements('breathing_count', breathingCount);
    });

    // Grounding completed
    window.addEventListener('groundingCompleted', async () => {
        const groundingCount = parseInt(localStorage.getItem('grounding_count') || '0') + 1;
        localStorage.setItem('grounding_count', groundingCount.toString());
        checkAchievements('grounding_count', groundingCount);
    });

    // Chat sent
    window.addEventListener('chatSent', async () => {
        const chatCount = parseInt(localStorage.getItem('chat_count') || '0') + 1;
        localStorage.setItem('chat_count', chatCount.toString());
        checkAchievements('chat_count', chatCount);
    });
}

