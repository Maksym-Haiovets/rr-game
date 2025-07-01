import { Router } from 'express';
import { db } from '../app';
import { Achievement, ApiResponse } from '../types/shared';

export const achievementsRouter = Router();

// Отримати всі досягнення
achievementsRouter.get('/', (req, res) => {
  db.all('SELECT * FROM achievements ORDER BY id', (err, rows: Achievement[]) => {
    if (err) {
      console.error('❌ Помилка отримання досягнень:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка отримання досягнень' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: rows 
    } as ApiResponse<Achievement[]>);
  });
});

// Розблокувати досягнення
achievementsRouter.put('/:code', (req, res) => {
  const { code } = req.params;

  db.run(
    'UPDATE achievements SET unlocked = 1, unlocked_at = CURRENT_TIMESTAMP WHERE code = ? AND unlocked = 0',
    [code],
    function(err) {
      if (err) {
        console.error('❌ Помилка розблокування досягнення:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Помилка розблокування досягнення' 
        } as ApiResponse);
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Досягнення не знайдено або вже розблоковано' 
        } as ApiResponse);
      }

      res.json({ 
        success: true, 
        data: { code, unlocked: true } 
      } as ApiResponse);
    }
  );
});

// Скинути всі досягнення (для тестування)
achievementsRouter.post('/reset', (req, res) => {
  db.run('UPDATE achievements SET unlocked = 0, unlocked_at = NULL', (err) => {
    if (err) {
      console.error('❌ Помилка скидання досягнень:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка скидання досягнень' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: { message: 'Всі досягнення скинуті' } 
    } as ApiResponse);
  });
});