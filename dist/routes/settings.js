"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettingsRouter = createSettingsRouter;
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
function createSettingsRouter(database) {
    const router = (0, express_1.Router)();
    // Get settings
    router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const settings = await database.getSettings();
        res.json({
            success: true,
            data: settings
        });
    }));
    // Update settings
    router.put('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const updates = req.body;
        // Validate numeric fields
        if (updates.risk_per_position !== undefined) {
            const risk = parseFloat(updates.risk_per_position);
            if (isNaN(risk) || risk <= 0 || risk > 100) {
                throw new ApiError_1.ApiError(400, 'Risk per position must be between 0.1 and 100');
            }
            updates.risk_per_position = risk;
        }
        if (updates.reward_ratio !== undefined) {
            const ratio = parseFloat(updates.reward_ratio);
            if (isNaN(ratio) || ratio <= 0 || ratio > 10) {
                throw new ApiError_1.ApiError(400, 'Reward ratio must be between 0.1 and 10');
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
//# sourceMappingURL=settings.js.map