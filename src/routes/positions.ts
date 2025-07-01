import express from 'express';
import { getDatabase } from '../database/init';
import { Position } from '../types/shared';

const router = express.Router();

// GET /api/positions - Get all positions
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();

    db.all("SELECT id, result FROM positions ORDER BY id", (err, rows: Position[]) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Помилка бази даних' });
      } else {
        res.json(rows);
      }
      db.close();
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// PUT /api/positions/:id - Update position result
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    if (!['none', 'take', 'stop'].includes(result)) {
      return res.status(400).json({ error: 'Недійсний результат позиції' });
    }

    const db = await getDatabase();

    db.run(
      "UPDATE positions SET result = ? WHERE id = ?",
      [result, id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Помилка оновлення позиції' });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Позицію не знайдено' });
        } else {
          res.json({ success: true, id: parseInt(id), result });
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/positions/reset - Reset all positions to 'none'
router.post('/reset', async (req, res) => {
  try {
    const db = await getDatabase();

    db.run("UPDATE positions SET result = 'none'", (err) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Помилка скидання позицій' });
      } else {
        res.json({ success: true, message: 'Всі позиції скинуті' });
      }
      db.close();
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

export default router;