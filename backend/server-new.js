const app = require('./app');
const { connectDatabase, disconnectDatabase } = require('./src/database');

const PORT = process.env.PORT || 5000;

// Start server (for local / Docker use)
const startServer = async () => {
  try {
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      console.warn('⚠️  Warning: Database connection failed. Running in offline mode...');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Prompt Library API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// If this file is run directly, start the server. When required by serverless wrapper, it won't start.
if (require.main === module) {
  startServer();
  process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM signal received');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🔄 SIGINT signal received');
    await disconnectDatabase();
    process.exit(0);
  });
}