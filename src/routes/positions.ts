import { Router } from 'express';
import { Database } from '../database/init';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';

export function createPositionsRouter(database: Database): Router {
  const router = Router();

  // Get all positions
  router.get('/', asyncHandler(async (req, res) => {
    const positions = await database.getAllPositions();
    res.json({
      success: true,
      data: positions
    });
  }));

  // Update single position
  router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { result } = req.body;

    const positionId = parseInt(id);
    if (isNaN(positionId) || positionId < 1 || positionId > 15) {
      throw new ApiError(400, 'Invalid position ID. Must be between 1 and 15');
    }

    if (!['none', 'take', 'stop'].includes(result)) {
      throw new ApiError(400, 'Invalid result. Must be none, take, or stop');
    }

    await database.updatePosition(positionId, result);

    res.json({
      success: true,
      message: `Position ${positionId} updated to ${result}`
    });
  }));

  // Reset all positions
  router.post('/reset', asyncHandler(async (req, res) => {
    await database.resetAllPositions();

    res.json({
      success: true,
      message: 'All positions reset to none'
    });
  }));

  return router;
}
