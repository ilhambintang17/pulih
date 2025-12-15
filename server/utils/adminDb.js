/**
 * Admin Database Operations
 * Modul terpisah untuk query khusus admin panel
 * @author Senior Backend Developer - Pulih Project
 */

const { pool } = require('./db');

/**
 * Get dashboard statistics
 * @returns {Object} Stats for dashboard cards
 */
async function getAdminStats() {
    try {
        // Total users
        const [usersResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const totalUsers = usersResult[0].total;

        // Users this month (for growth calculation)
        const [usersThisMonth] = await pool.execute(
            `SELECT COUNT(*) as total FROM users 
             WHERE joinedDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
        );

        // Active sessions (chats updated in last 24 hours)
        const [activeSessions] = await pool.execute(
            `SELECT COUNT(*) as total FROM chats 
             WHERE updatedAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
        );

        // Pending verifications (users without email verified - simplified)
        const [pendingVerifications] = await pool.execute(
            `SELECT COUNT(*) as total FROM users WHERE email IS NULL AND isAnonymous = 0`
        );

        // Anonymous users count
        const [anonymousUsers] = await pool.execute(
            `SELECT COUNT(*) as total FROM users WHERE isAnonymous = 1`
        );

        // Registered users count
        const [registeredUsers] = await pool.execute(
            `SELECT COUNT(*) as total FROM users WHERE isAnonymous = 0`
        );

        return {
            totalUsers,
            usersThisMonth: usersThisMonth[0].total,
            activeSessions: activeSessions[0].total,
            pendingVerifications: pendingVerifications[0].total,
            reports: 0, // Placeholder - no reports table yet
            anonymousUsers: anonymousUsers[0].total,
            registeredUsers: registeredUsers[0].total
        };
    } catch (err) {
        console.error('Error getting admin stats:', err);
        throw err;
    }
}

/**
 * Get all users with pagination and filters
 * @param {Object} options - Query options
 * @returns {Object} Users list with pagination info
 */
async function getAllUsers(options = {}) {
    const {
        page = 1,
        limit = 10,
        search = '',
        type = 'all', // 'all', 'registered', 'anonymous'
        status = 'all' // 'all', 'active', 'suspended'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params = [];

    // Search filter
    if (search) {
        whereClause += ' AND (fullName LIKE ? OR email LIKE ? OR id LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    // Type filter
    if (type === 'registered') {
        whereClause += ' AND isAnonymous = 0';
    } else if (type === 'anonymous') {
        whereClause += ' AND isAnonymous = 1';
    }

    // Note: status filter would need a 'status' column in users table
    // For now, we'll skip this or add it later

    // Get total count
    const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get users
    const [users] = await pool.execute(
        `SELECT id, username, fullName, nickname, email, isAnonymous, joinedDate, lastLogin, streak
         FROM users 
         WHERE ${whereClause}
         ORDER BY joinedDate DESC
         LIMIT ? OFFSET ?`,
        [...params, String(limit), String(offset)]
    );

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

/**
 * Get user by ID with additional stats
 * @param {string} userId 
 * @returns {Object} User with stats
 */
async function getUserById(userId) {
    const [users] = await pool.execute(
        `SELECT id, username, fullName, nickname, email, phone, bio, isAnonymous, joinedDate, lastLogin, streak
         FROM users WHERE id = ?`,
        [userId]
    );

    if (!users[0]) return null;

    // Get additional stats
    const [chatCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM chats WHERE userId = ?',
        [userId]
    );

    const [journalCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM journal_entries WHERE userId = ?',
        [userId]
    );

    const [moodCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM mood_logs WHERE userId = ?',
        [userId]
    );

    return {
        ...users[0],
        stats: {
            chatSessions: chatCount[0].total,
            journalEntries: journalCount[0].total,
            moodLogs: moodCount[0].total
        }
    };
}

/**
 * Update user status (for suspension etc.)
 * Note: This requires adding a 'status' column to users table
 * For now, we'll implement a simple version
 */
async function updateUserStatus(userId, status) {
    // For now, just return success - implement when status column exists
    return { success: true, userId, status };
}

/**
 * Delete user and all related data
 * @param {string} userId 
 */
async function deleteUser(userId) {
    // CASCADE will handle related records
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    return { success: true };
}

/**
 * Get recent journal entries for monitoring
 * @param {number} limit 
 * @returns {Array} Recent journals
 */
async function getRecentJournals(limit = 10) {
    const [journals] = await pool.execute(
        `SELECT j.id, j.userId, j.content, j.createdAt,
                u.fullName, u.username, u.isAnonymous
         FROM journal_entries j
         LEFT JOIN users u ON j.userId = u.id
         ORDER BY j.createdAt DESC
         LIMIT ?`,
        [String(limit)]
    );

    return journals.map(j => {
        // Determine display name: use username if available, else fullName, else generate anonymous name
        let displayName;
        if (j.isAnonymous) {
            displayName = j.username ? `@${j.username}` : `Anonim_${j.userId.slice(-4)}`;
        } else {
            displayName = j.fullName || j.username || 'User';
        }

        return {
            id: j.id,
            odriginUserId: j.userId,
            userId: j.isAnonymous ? `ANO-${j.userId.slice(-4)}` : `USR-${j.userId.slice(-4)}`,
            content: j.content.length > 50 ? j.content.substring(0, 50) + '...' : j.content,
            fullContent: j.content,
            createdAt: j.createdAt,
            userName: displayName,
            isAnonymous: j.isAnonymous
        };
    });
}

/**
 * Get recent chats for dashboard monitoring
 * @param {number} limit 
 * @returns {Array} Recent chats
 */
async function getRecentChats(limit = 10) {
    const [chats] = await pool.execute(
        `SELECT c.id, c.userId, c.title, c.createdAt, c.updatedAt, c.messages,
                u.fullName, u.username, u.isAnonymous
         FROM chats c
         LEFT JOIN users u ON c.userId = u.id
         ORDER BY c.updatedAt DESC
         LIMIT ?`,
        [String(limit)]
    );

    return chats.map(chat => {
        // Parse messages to get last message
        let lastMessage = '';
        let messageCount = 0;
        try {
            const messages = typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages;
            if (Array.isArray(messages) && messages.length > 0) {
                messageCount = messages.length;
                const lastMsg = messages[messages.length - 1];
                lastMessage = lastMsg.content ? lastMsg.content.substring(0, 50) + '...' : '';
            }
        } catch (e) {
            lastMessage = 'Error parsing messages';
        }

        // Display name
        let displayName;
        if (chat.isAnonymous) {
            displayName = chat.username ? `@${chat.username}` : `Anonim_${chat.userId.slice(-4)}`;
        } else {
            displayName = chat.fullName || chat.username || 'User';
        }

        return {
            id: chat.id,
            odriginUserId: chat.userId,
            title: chat.title || 'Sesi Konseling',
            lastMessage,
            messageCount,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            userName: displayName,
            isAnonymous: chat.isAnonymous
        };
    });
}

/**
 * Get chat history for a specific user
 * @param {string} userId 
 * @returns {Array} User's chats
 */
async function getUserChats(userId) {
    const [chats] = await pool.execute(
        `SELECT id, title, createdAt, updatedAt, messages
         FROM chats
         WHERE userId = ?
         ORDER BY updatedAt DESC`,
        [userId]
    );

    return chats.map(chat => {
        let messageCount = 0;
        let messages = [];
        try {
            messages = typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages;
            messageCount = Array.isArray(messages) ? messages.length : 0;
        } catch (e) { }

        return {
            id: chat.id,
            title: chat.title || 'Sesi Konseling',
            messageCount,
            messages: messages.slice(-5), // Last 5 messages for preview
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        };
    });
}

/**
 * Get single chat by ID with full messages
 * @param {string} chatId 
 * @returns {Object} Chat with messages
 */
async function getChatById(chatId) {
    const [chats] = await pool.execute(
        `SELECT c.*, u.fullName, u.username, u.isAnonymous
         FROM chats c
         LEFT JOIN users u ON c.userId = u.id
         WHERE c.id = ?`,
        [chatId]
    );

    if (!chats[0]) return null;

    const chat = chats[0];
    let messages = [];
    try {
        messages = typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages;
    } catch (e) { }

    let displayName;
    if (chat.isAnonymous) {
        displayName = chat.username ? `@${chat.username}` : `Anonim_${chat.userId.slice(-4)}`;
    } else {
        displayName = chat.fullName || chat.username || 'User';
    }

    return {
        id: chat.id,
        userId: chat.userId,
        title: chat.title,
        messages,
        userName: displayName,
        isAnonymous: chat.isAnonymous,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    };
}

/**
 * Get counseling activity data for chart
 * @param {number} days - Number of days to look back
 * @returns {Array} Activity data grouped by date
 */
async function getCounselingActivity(days = 30) {
    const [activity] = await pool.execute(
        `SELECT DATE(createdAt) as date, COUNT(*) as sessions
         FROM chats
         WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         GROUP BY DATE(createdAt)
         ORDER BY date ASC`,
        [days]
    );

    return activity;
}

/**
 * Get mood statistics aggregated
 * @returns {Object} Mood stats
 */
async function getMoodStats() {
    const [moodDistribution] = await pool.execute(
        `SELECT moodLevel, COUNT(*) as count
         FROM mood_logs
         WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY moodLevel
         ORDER BY moodLevel`
    );

    const [avgMood] = await pool.execute(
        `SELECT AVG(moodLevel) as average
         FROM mood_logs
         WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    return {
        distribution: moodDistribution,
        weeklyAverage: avgMood[0].average || 0
    };
}

module.exports = {
    getAdminStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getRecentJournals,
    getRecentChats,
    getUserChats,
    getChatById,
    getCounselingActivity,
    getMoodStats
};
