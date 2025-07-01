import { Router } from 'express';
import { db } from '../app';
import { UserSettings, ApiResponse } from '../types/shared';

export const settingsRouter = Router();

// Отримати налаштування
settingsRouter.get('/', (req, res) => {
  db.get('SELECT * FROM user_settings WHERE id = 1', (err, row: UserSettings) => {
    if (err) {
      console.error('❌ Помилка отримання налаштувань:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка отримання налаштувань' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: row 
    } as ApiResponse);
  });
});

// Оновити налаштування
settingsRouter.put('/', (req, res) => {
  const { risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever } = req.body;

  // Валідація
  if (risk_per_position !== undefined && (risk_per_position < 0.1 || risk_per_position > 10)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Ризик має бути від 0.1% до 10%' 
    } as ApiResponse);
  }

  if (reward_ratio !== undefined && (reward_ratio < 1 || reward_ratio > 5)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Співвідношення прибутку має бути від 1 до 5' 
    } as ApiResponse);
  }

  // Будуємо динамічний запит
  const updates: string[] = [];
  const values: any[] = [];

  if (risk_per_position !== undefined) {
    updates.push('risk_per_position = ?');
    values.push(risk_per_position);
  }

  if (reward_ratio !== undefined) {
    updates.push('reward_ratio = ?');
    values.push(reward_ratio);
  }

  if (tutorial_completed !== undefined) {
    updates.push('tutorial_completed = ?');
    values.push(tutorial_completed ? 1 : 0);
  }

  if (tutorial_skipped_forever !== undefined) {
    updates.push('tutorial_skipped_forever = ?');
    values.push(tutorial_skipped_forever ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Немає даних для оновлення' 
    } as ApiResponse);
  }

  values.push(1); // ID для WHERE умови

  const query = `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      console.error('❌ Помилка оновлення налаштувань:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка оновлення налаштувань' 
      } as ApiResponse);
    }

    res.json({ 
      success: true, 
      data: { message: 'Налаштування оновлені' } 
    } as ApiResponse);
  });
});