import express from 'express';
import path from 'path';
import { Database } from 'sqlite3';
import { initDatabase } from './database/init';
import { positionsRouter } from './routes/positions';
import { settingsRouter } from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Глобальна змінна для бази даних
export let db: Database;

async function startServer() {
  try {
    console.log('🔧 Ініціалізація бази даних...');
    db = await initDatabase();
    console.log('✅ База даних готова');

    // Маршрути API
    app.use('/api/positions', positionsRouter);
    app.use('/api/settings', settingsRouter);

    // Обробка помилок
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Помилка сервера:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      });
    });

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
      console.log(`📊 API доступне на http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🔄 Зупинка сервера...');
      if (db) {
        db.close((err) => {
          if (err) {
            console.error('❌ Помилка при закритті БД:', err);
          } else {
            console.log('✅ База даних закрита');
          }
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('💥 Критична помилка запуску:', error);
    process.exit(1);
  }
}

startServer();