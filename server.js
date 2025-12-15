const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./server/routes/auth');
const chatRoutes = require('./server/routes/chat');
const profileRoutes = require('./server/routes/profile');
const { initDB } = require('./server/utils/db');

// Initialize database
initDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files
app.use(express.static('data'));   // Serve data files (affirmations, etc.)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/mood', require('./server/routes/mood'));
app.use('/api/journal', require('./server/routes/journal'));
app.use('/api/utils', require('./server/routes/utils'));

// New Feature Routes
app.use('/api/assessment', require('./server/routes/assessment'));
app.use('/api/achievements', require('./server/routes/achievements'));
app.use('/api/safetyplan', require('./server/routes/safetyplan'));
app.use('/api/grounding', require('./server/routes/grounding'));

// Admin Panel Routes (separate from main app)
app.use('/api/admin', require('./server/routes/admin'));

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});

