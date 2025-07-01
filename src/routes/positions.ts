import { Router } from 'express';
import { db } from '../app';
import { Position, ApiResponse } from '../types/shared';

export const positionsRouter = Router();

// Отримати всі позиції
positionsRouter.get('/', (req, res) => {
  db.all('SELECT * FROM positions ORDER BY id', (err, rows: Position[]) => {
    if (err) {
      console.error('❌ Помилка отримання позицій:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка отримання позицій' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: rows 
    } as ApiResponse<Position[]>);
  });
});

// Оновити позицію
positionsRouter.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { result } = req.body;

  if (!['none', 'take', 'stop'].includes(result)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Некоректне значення result' 
    } as ApiResponse);
  }

  if (id < 1 || id > 15) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID позиції має бути від 1 до 15' 
    } as ApiResponse);
  }

  db.run(
    'UPDATE positions SET result = ? WHERE id = ?',
    [result, id],
    function(err) {
      if (err) {
        console.error('❌ Помилка оновлення позиції:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Помилка оновлення позиції' 
        } as ApiResponse);
      }

      res.json({ 
        success: true, 
        data: { id, result } 
      } as ApiResponse);
    }
  );
});

// Скинути всі позиції
positionsRouter.post('/reset', (req, res) => {
  db.run('UPDATE positions SET result = ?', ['none'], (err) => {
    if (err) {
      console.error('❌ Помилка скидання позицій:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка скидання позицій' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: { message: 'Всі позиції скинуті' } 
    } as ApiResponse);
  });
});