"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPositionsRouter = createPositionsRouter;
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
function createPositionsRouter(database) {
    const router = (0, express_1.Router)();
    // Get all positions
    router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const positions = await database.getAllPositions();
        res.json({
            success: true,
            data: positions
        });
    }));
    // Update single position
    router.put('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { result } = req.body;
        const positionId = parseInt(id);
        if (isNaN(positionId) || positionId < 1 || positionId > 15) {
            throw new ApiError_1.ApiError(400, 'Invalid position ID. Must be between 1 and 15');
        }
        if (!['none', 'take', 'stop'].includes(result)) {
            throw new ApiError_1.ApiError(400, 'Invalid result. Must be none, take, or stop');
        }
        await database.updatePosition(positionId, result);
        res.json({
            success: true,
            message: `Position ${positionId} updated to ${result}`
        });
    }));
    // Reset all positions
    router.post('/reset', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await database.resetAllPositions();
        res.json({
            success: true,
            message: 'All positions reset to none'
        });
    }));
    return router;
}
//# sourceMappingURL=positions.js.map