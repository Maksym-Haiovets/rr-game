import express from 'express';
import cors from 'cors';
import path from 'path';
import { getDatabase, Database } from './database/init';
import { errorHandler } from './middleware/errorHandler';
import { createPositionsRouter } from './routes/positions';
import { createSettingsRouter } from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Global database instance
let database: Database;

// Initialize application
async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Initializing application...');

    // Initialize database first
    database = await getDatabase();
    console.log('✅ Database initialized successfully');

    // Setup routes with database instance
    app.use('/api/positions', createPositionsRouter(database));
    app.use('/api/settings', createSettingsRouter(database));

    // Error handling middleware (should be last)
    app.use(errorHandler);

    console.log('✅ Routes configured');

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start server only after initialization
async function startServer(): Promise<void> {
  try {
    await initializeApp();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
      console.log(`📊 API доступне на http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📥 Received ${signal}. Shutting down gracefully...`);

      server.close(() => {
        console.log('🔒 HTTP server closed');
      });

      if (database) {
        await database.close();
      }

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer().catch((error) => {
  console.error('❌ Unhandled error during startup:', error);
  process.exit(1);
});

export default app;
