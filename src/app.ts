import express from 'express';
import path from 'path';
import { initDatabase, getDatabase } from './database/init';
import positionsRouter from './routes/positions';
import settingsRouter from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/positions', positionsRouter);
app.use('/api/settings', settingsRouter);

// Serve the main page for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
    });

    // Додай цей блок тут ▼▼▼
     process.on('SIGINT', async () => {
      console.log('🛑 Отримано сигнал SIGINT. Зупиняємо сервер...');
       server.close( async () => {
        console.log('🔒 Сервер зупинено. Закриваємо зʼєднання з БД...');
        const db = await getDatabase();

        db.close(() => {
          console.log('✅ Зʼєднання з БД закрито');
          process.exit(0);
        });
      });
    });
    // ▲▲▲ Кінець нового коду
  } catch (error) {
    console.error('❌ Помилка запуску сервера:', error);
    process.exit(1);
  }
}

startServer();