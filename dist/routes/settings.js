"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const router = express_1.default.Router();
// GET /api/settings - Get user settings
router.get('/', async (req, res) => {
    try {
        const db = await (0, init_1.getDatabase)();
        db.get("SELECT * FROM user_settings WHERE id = 1", (err, row) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Помилка бази даних' });
            }
            else if (!row) {
                // Create default settings if not found
                db.run(`
          INSERT INTO user_settings (id, risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever)
          VALUES (1, 1.0, 2.0, 0, 0)
        `, (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        res.status(500).json({ error: 'Помилка створення налаштувань' });
                    }
                    else {
                        res.json({
                            id: 1,
                            risk_per_position: 1.0,
                            reward_ratio: 2.0,
                            tutorial_completed: false,
                            tutorial_skipped_forever: false
                        });
                    }
                });
            }
            else {
                // Convert SQLite boolean (0/1) to JavaScript boolean
                const settings = {
                    ...row,
                    tutorial_completed: Boolean(row.tutorial_completed),
                    tutorial_skipped_forever: Boolean(row.tutorial_skipped_forever)
                };
                res.json(settings);
            }
            db.close();
        });
    }
    catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// PUT /api/settings - Update user settings
router.put('/', async (req, res) => {
    try {
        const updates = req.body;
        const allowedFields = ['risk_per_position', 'reward_ratio', 'tutorial_completed', 'tutorial_skipped_forever'];
        // Filter only allowed fields
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                filteredUpdates[field] = updates[field];
            }
        }
        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({ error: 'Немає дійсних полів для оновлення' });
        }
        // Validate numeric fields
        if (filteredUpdates.risk_per_position !== undefined) {
            const risk = parseFloat(filteredUpdates.risk_per_position);
            if (isNaN(risk) || risk < 0.1 || risk > 10) {
                return res.status(400).json({ error: 'Ризик має бути від 0.1% до 10%' });
            }
        }
        if (filteredUpdates.reward_ratio !== undefined) {
            const reward = parseFloat(filteredUpdates.reward_ratio);
            if (isNaN(reward) || reward < 1 || reward > 5) {
                return res.status(400).json({ error: 'Співвідношення прибутку має бути від 1 до 5' });
            }
        }
        const db = await (0, init_1.getDatabase)();
        // Build UPDATE query dynamically
        const setClause = Object.keys(filteredUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(filteredUpdates);
        db.run(`UPDATE user_settings SET ${setClause} WHERE id = 1`, values, function (err) {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Помилка оновлення налаштувань' });
            }
            else if (this.changes === 0) {
                res.status(404).json({ error: 'Налаштування не знайдено' });
            }
            else {
                res.json({ success: true, updated: filteredUpdates });
            }
            db.close();
        });
    }
    catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
exports.default = router;
