require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('✅ Starting Mock API Server (No Database)...');
console.log(`🚀 This is for testing only - using mock data`);

// Mock data
const mockPrompts = [
  {
    id: '1',
    title: 'Email Marketing Campaign Brief',
    description: 'Create a comprehensive brief for an email marketing campaign',
    prompt: 'Write a detailed email marketing campaign brief that includes: target audience, key messages, email copy, CTA, and success metrics.',
    category: 'Marketing',
    tags: ['email', 'marketing', 'campaign'],
    difficulty: 'medium',
    estimatedTime: '15-20 minutes',
    placeholders: ['[PRODUCT_NAME]', '[TARGET_AUDIENCE]', '[GOAL]'],
    rating: 4.5,
    usageCount: 234,
    author: { id: 'user1', name: 'John Doe', avatar: null },
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Product Launch Strategy',
    description: 'Template for planning a product launch',
    prompt: 'Develop a comprehensive product launch strategy that covers pre-launch, launch day, and post-launch activities.',
    category: 'Strategy',
    tags: ['launch', 'strategy', 'product'],
    difficulty: 'hard',
    estimatedTime: '20-30 minutes',
    placeholders: ['[PRODUCT_NAME]', '[MARKET]', '[BUDGET]'],
    rating: 4.8,
    usageCount: 156,
    author: { id: 'user2', name: 'Jane Smith', avatar: null },
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Customer Feedback Analysis',
    description: 'Framework for analyzing and acting on customer feedback',
    prompt: 'Create a system to collect, analyze, and respond to customer feedback effectively.',
    category: 'Product',
    tags: ['feedback', 'customer', 'analysis'],
    difficulty: 'easy',
    estimatedTime: '10-15 minutes',
    placeholders: ['[FEEDBACK_SOURCE]', '[TEAM]'],
    rating: 4.2,
    usageCount: 89,
    author: { id: 'user1', name: 'John Doe', avatar: null },
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockCategories = [
  { id: '1', name: 'Marketing', description: 'Marketing and promotional content', color: '#FF6B6B', icon: '📢', promptCount: 1 },
  { id: '2', name: 'Strategy', description: 'Strategic planning and business strategy', color: '#4ECDC4', icon: '📊', promptCount: 1 },
  { id: '3', name: 'Content', description: 'Content creation and copywriting', color: '#45B7D1', icon: '✍️', promptCount: 0 },
  { id: '4', name: 'Product', description: 'Product management and development', color: '#FFA07A', icon: '🛠️', promptCount: 1 }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'mock-test',
    database: 'MOCK DATA ONLY'
  });
});

// Prompts endpoints
app.get('/api/prompts', (req, res) => {
  const { category, search, limit = 50 } = req.query;
  let results = mockPrompts;
  
  if (category) {
    results = results.filter(p => p.category === category);
  }
  
  if (search) {
    results = results.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  results = results.slice(0, parseInt(limit));
  
  res.json({ 
    data: results,
    status: 'MOCK DATA',
    message: 'Using mock data - database unavailable'
  });
});

app.get('/api/prompts/:id', (req, res) => {
  const prompt = mockPrompts.find(p => p.id === req.params.id);
  
  if (!prompt) {
    return res.status(404).json({ error: 'Prompt not found' });
  }
  
  res.json({ 
    data: prompt,
    status: 'MOCK DATA'
  });
});

// Categories endpoints
app.get('/api/categories', (req, res) => {
  res.json({ 
    data: mockCategories,
    status: 'MOCK DATA'
  });
});

// Create endpoints (mock - just return success)
app.post('/api/prompts', (req, res) => {
  res.status(201).json({ 
    data: { 
      id: 'new-' + Date.now(),
      ...req.body,
      createdAt: new Date()
    },
    message: 'MOCK: Data not persisted (no database)',
    status: 'MOCK'
  });
});

app.post('/api/categories', (req, res) => {
  res.status(201).json({ 
    data: { 
      id: 'new-' + Date.now(),
      ...req.body,
      createdAt: new Date()
    },
    message: 'MOCK: Data not persisted (no database)',
    status: 'MOCK'
  });
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    token: 'mock-token-' + Date.now(),
    user: { id: 'mock-user', name: 'Mock User', email: 'mock@test.com' },
    status: 'MOCK'
  });
});

app.post('/api/auth/signup', (req, res) => {
  res.status(201).json({ 
    token: 'mock-token-' + Date.now(),
    user: { id: 'mock-user', name: req.body.name, email: req.body.email },
    message: 'MOCK: User not actually created',
    status: 'MOCK'
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({ 
    data: {
      totalPrompts: mockPrompts.length,
      totalCategories: mockCategories.length,
      totalUsers: 0,
      totalViews: 1000
    },
    status: 'MOCK DATA'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🎉 Mock API Server is Running!                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');
  console.log(`║  URL: http://localhost:${PORT}                                 ║`);
  console.log('║  Health: http://localhost:5000/health                      ║');
  console.log('║  API: http://localhost:5000/api                            ║');
  console.log('║                                                            ║');
  console.log('║  📚 Available Endpoints:                                   ║');
  console.log('║  GET  /health                                              ║');
  console.log('║  GET  /api/prompts                                         ║');
  console.log('║  GET  /api/prompts/:id                                     ║');
  console.log('║  POST /api/prompts                                         ║');
  console.log('║  GET  /api/categories                                      ║');
  console.log('║  POST /api/categories                                      ║');
  console.log('║  POST /api/auth/login                                      ║');
  console.log('║  POST /api/auth/signup                                     ║');
  console.log('║  GET  /api/stats                                           ║');
  console.log('║                                                            ║');
  console.log('║  ⚠️  IMPORTANT: This is MOCK DATA ONLY                      ║');
  console.log('║  • Database connection is not available                   ║');
  console.log('║  • Data is NOT persisted                                   ║');
  console.log('║  • For development/testing only                            ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nServer shutting down...');
  process.exit(0);
});
