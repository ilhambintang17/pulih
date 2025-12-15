/**
 * Admin Routes
 * API endpoints untuk admin panel - terpisah dari routes utama
 * @author Senior Backend Developer - Pulih Project
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const adminDb = require('../utils/adminDb');

// ========================================
// Admin Credentials from Environment Variables
// ========================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Active tokens (in production, use Redis or database)
const activeTokens = new Map();

// Rate limiting: track failed attempts by IP
const failedAttempts = new Map();

/**
 * Hash password with SHA256
 */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Generate secure token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Get lockout time based on failed attempts (exponential backoff)
 * 1st fail: 10s, 2nd: 60s, 3rd: 120s, 4th: 240s, etc.
 */
function getLockoutTime(attempts) {
    if (attempts <= 0) return 0;
    if (attempts === 1) return 10 * 1000;      // 10 detik
    if (attempts === 2) return 60 * 1000;      // 60 detik
    if (attempts === 3) return 120 * 1000;     // 120 detik
    // Setelah itu double setiap kali (240, 480, 960, ...)
    return Math.min(120 * 1000 * Math.pow(2, attempts - 3), 24 * 60 * 60 * 1000); // Max 24 jam
}

/**
 * Check if IP is locked out
 */
function checkRateLimit(ip) {
    const record = failedAttempts.get(ip);
    if (!record) return { locked: false };

    const lockoutTime = getLockoutTime(record.count);
    const timeSinceLastAttempt = Date.now() - record.lastAttempt;

    if (timeSinceLastAttempt < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - timeSinceLastAttempt) / 1000);
        return {
            locked: true,
            remainingSeconds: remainingTime,
            attempts: record.count
        };
    }

    return { locked: false, attempts: record.count };
}

/**
 * Record failed attempt
 */
function recordFailedAttempt(ip) {
    const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    record.count += 1;
    record.lastAttempt = Date.now();
    failedAttempts.set(ip, record);
    return record.count;
}

/**
 * Clear failed attempts on successful login
 */
function clearFailedAttempts(ip) {
    failedAttempts.delete(ip);
}

/**
 * Verify admin token middleware
 */
function verifyAdminToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized', redirect: '/admin/login.html' });
    }

    req.admin = activeTokens.get(token);
    next();
}

// ========================================
// Authentication Endpoints
// ========================================

/**
 * POST /api/admin/auth/login
 * Admin login with rate limiting
 */
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (rateCheck.locked) {
        console.log(`[Admin] Login blocked for IP ${ip}, ${rateCheck.remainingSeconds}s remaining (attempt #${rateCheck.attempts})`);
        return res.status(429).json({
            error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${rateCheck.remainingSeconds} detik.`,
            retryAfter: rateCheck.remainingSeconds,
            attempts: rateCheck.attempts
        });
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password diperlukan' });
    }

    // Check credentials against environment variables
    const isValidUsername = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();
    const isValidPassword = password === ADMIN_PASSWORD;

    if (!isValidUsername || !isValidPassword) {
        const attempts = recordFailedAttempt(ip);
        const nextLockout = getLockoutTime(attempts) / 1000;
        console.log(`[Admin] Login failed for IP ${ip}, attempt #${attempts}, next lockout: ${nextLockout}s`);
        return res.status(401).json({
            error: 'Username atau password salah',
            warning: attempts >= 1 ? `Percobaan ke-${attempts}. Gagal lagi akan terkunci ${nextLockout} detik.` : null
        });
    }

    // Successful login - clear failed attempts
    clearFailedAttempts(ip);

    // Generate token
    const token = generateToken();
    activeTokens.set(token, {
        username,
        name: 'Administrator',
        role: 'super_admin',
        loginTime: new Date()
    });

    console.log(`[Admin] Login successful: ${username} from IP ${ip}`);

    res.json({
        success: true,
        token,
        admin: {
            username,
            name: 'Administrator',
            role: 'super_admin'
        }
    });
});

/**
 * POST /api/admin/auth/logout
 * Admin logout
 */
router.post('/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token && activeTokens.has(token)) {
        const admin = activeTokens.get(token);
        console.log(`[Admin] Logout: ${admin.username}`);
        activeTokens.delete(token);
    }

    res.json({ success: true });
});

/**
 * GET /api/admin/auth/verify
 * Verify token is valid
 */
router.get('/auth/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ valid: false });
    }

    const admin = activeTokens.get(token);
    res.json({
        valid: true,
        admin: {
            username: admin.username,
            name: admin.name,
            role: admin.role
        }
    });
});

// ========================================
// Dashboard Endpoints
// ========================================

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await adminDb.getAdminStats();
        res.json(stats);
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/admin/activity
 * Get counseling activity data for chart
 */
router.get('/activity', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const activity = await adminDb.getCounselingActivity(days);
        res.json(activity);
    } catch (err) {
        console.error('Admin activity error:', err);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

/**
 * GET /api/admin/journals/recent
 * Get recent journal entries for monitoring
 */
router.get('/journals/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const journals = await adminDb.getRecentJournals(limit);
        res.json(journals);
    } catch (err) {
        console.error('Admin journals error:', err);
        res.status(500).json({ error: 'Failed to fetch journals' });
    }
});

/**
 * GET /api/admin/mood-stats
 * Get aggregated mood statistics
 */
router.get('/mood-stats', async (req, res) => {
    try {
        const stats = await adminDb.getMoodStats();
        res.json(stats);
    } catch (err) {
        console.error('Admin mood stats error:', err);
        res.status(500).json({ error: 'Failed to fetch mood stats' });
    }
});

// ========================================
// User Management Endpoints
// ========================================

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            type: req.query.type || 'all',
            status: req.query.status || 'all'
        };

        const result = await adminDb.getAllUsers(options);
        res.json(result);
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', async (req, res) => {
    try {
        const user = await adminDb.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Admin user detail error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/**
 * PATCH /api/admin/users/:id/status
 * Update user status (active/suspended)
 */
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['active', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await adminDb.updateUserStatus(req.params.id, status);
        res.json(result);
    } catch (err) {
        console.error('Admin status update error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user account
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const result = await adminDb.deleteUser(req.params.id);
        res.json(result);
    } catch (err) {
        console.error('Admin delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ========================================
// Chat Monitoring Endpoints
// ========================================

/**
 * GET /api/admin/chats/recent
 * Get recent chats for dashboard monitoring
 */
router.get('/chats/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const chats = await adminDb.getRecentChats(limit);
        res.json(chats);
    } catch (err) {
        console.error('Admin recent chats error:', err);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

/**
 * GET /api/admin/chats/:id
 * Get single chat with full messages
 */
router.get('/chats/:id', async (req, res) => {
    try {
        const chat = await adminDb.getChatById(req.params.id);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        res.json(chat);
    } catch (err) {
        console.error('Admin chat detail error:', err);
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

/**
 * GET /api/admin/users/:id/chats
 * Get all chats for a specific user
 */
router.get('/users/:id/chats', async (req, res) => {
    try {
        const chats = await adminDb.getUserChats(req.params.id);
        res.json(chats);
    } catch (err) {
        console.error('Admin user chats error:', err);
        res.status(500).json({ error: 'Failed to fetch user chats' });
    }
});

module.exports = router;
