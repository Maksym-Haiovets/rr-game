import { Database } from 'sqlite3';
import path from 'path';

export function initDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(process.cwd(), 'database.db');
    const db = new Database(dbPath);

    db.serialize(() => {
      // Створення таблиці позицій
      db.run(`
        CREATE TABLE IF NOT EXISTS positions (
          id INTEGER PRIMARY KEY,
          result TEXT DEFAULT 'none' CHECK(result IN ('none', 'take', 'stop'))
        )
      `, (err) => {
        if (err) {
          console.error('❌ Помилка створення таблиці positions:', err);
          reject(err);
          return;
        }
        console.log('✅ Таблиця positions готова');
      });

      // Вставка дефолтних позицій
      const insertPositions = db.prepare('INSERT OR IGNORE INTO positions (id, result) VALUES (?, ?)');
      for (let i = 1; i <= 15; i++) {
        insertPositions.run(i, 'none');
      }
      insertPositions.finalize();
      console.log('✅ Дефолтні позиції створені');

      // Створення таблиці налаштувань
      db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          risk_per_position REAL DEFAULT 1.0,
          reward_ratio REAL DEFAULT 2.0,
          tutorial_completed BOOLEAN DEFAULT 0,
          tutorial_skipped_forever BOOLEAN DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('❌ Помилка створення таблиці user_settings:', err);
          reject(err);
          return;
        }
        console.log('✅ Таблиця user_settings готова');
      });

      // Вставка дефолтних налаштувань
      db.run(`
        INSERT OR IGNORE INTO user_settings (id, risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever)
        VALUES (1, 1.0, 2.0, 0, 0)
      `, (err) => {
        if (err) {
          console.error('❌ Помилка вставки дефолтних налаштувань:', err);
        } else {
          console.log('✅ Дефолтні налаштування створені');
        }
      });

      resolve(db);
    });
  });
}