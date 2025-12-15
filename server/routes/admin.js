/**
 * Admin Routes
 * API endpoints untuk admin panel - terpisah dari routes utama
 * @author Senior Backend Developer - Pulih Project
 */

const express = require('express');
const router = express.Router();
const adminDb = require('../utils/adminDb');

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
