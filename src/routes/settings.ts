import { Router } from 'express';
import { Database } from '../database/init';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';

export function createSettingsRouter(database: Database): Router {
  const router = Router();

  // Get settings
  router.get('/', asyncHandler(async (req, res) => {
    const settings = await database.getSettings();
    res.json({
      success: true,
      data: settings
    });
  }));

  // Update settings
  router.put('/', asyncHandler(async (req, res) => {
    const updates = req.body;

    // Validate numeric fields
    if (updates.risk_per_position !== undefined) {
      const risk = parseFloat(updates.risk_per_position);
      if (isNaN(risk) || risk <= 0 || risk > 100) {
        throw new ApiError(400, 'Risk per position must be between 0.1 and 100');
      }
      updates.risk_per_position = risk;
    }

    if (updates.reward_ratio !== undefined) {
      const ratio = parseFloat(updates.reward_ratio);
      if (isNaN(ratio) || ratio <= 0 || ratio > 10) {
        throw new ApiError(400, 'Reward ratio must be between 0.1 and 10');
      }
      updates.reward_ratio = ratio;
    }

    // Validate boolean fields
    if (updates.tutorial_completed !== undefined) {
      updates.tutorial_completed = Boolean(updates.tutorial_completed);
    }

    if (updates.tutorial_skipped_forever !== undefined) {
      updates.tutorial_skipped_forever = Boolean(updates.tutorial_skipped_forever);
    }

    await database.updateSettings(updates);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  }));

  return router;
}
