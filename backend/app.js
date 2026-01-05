require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { connectDatabase, disconnectDatabase } = require('./src/database');
const { optionalAuth, authenticateToken } = require('./src/middleware/auth');
const authRoutes = require('./src/routes/auth');
const activityService = require('./src/services/activityService');

// Import updated API routes
const promptRoutes = require('./src/routes/prompts');
const categoryRoutes = require('./src/routes/categories');
const statsRoutes = require('./src/routes/stats');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', optionalAuth, promptRoutes);
app.use('/api/categories', optionalAuth, categoryRoutes);
app.use('/api/stats', optionalAuth, statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
module.exports.connectDatabase = connectDatabase;
module.exports.disconnectDatabase = disconnectDatabase;
