"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const app_1 = require("../app");
exports.settingsRouter = (0, express_1.Router)();
// Отримати налаштування
exports.settingsRouter.get('/', (req, res) => {
    app_1.db.get('SELECT * FROM user_settings WHERE id = 1', (err, row) => {
        if (err) {
            console.error('❌ Помилка отримання налаштувань:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка отримання налаштувань'
            });
        }
        res.json({
            success: true,
            data: row
        });
    });
});
// Оновити налаштування
exports.settingsRouter.put('/', (req, res) => {
    const { risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever } = req.body;
    // Валідація
    if (risk_per_position !== undefined && (risk_per_position < 0.1 || risk_per_position > 10)) {
        return res.status(400).json({
            success: false,
            error: 'Ризик має бути від 0.1% до 10%'
        });
    }
    if (reward_ratio !== undefined && (reward_ratio < 1 || reward_ratio > 5)) {
        return res.status(400).json({
            success: false,
            error: 'Співвідношення прибутку має бути від 1 до 5'
        });
    }
    // Будуємо динамічний запит
    const updates = [];
    const values = [];
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
        });
    }
    values.push(1); // ID для WHERE умови
    const query = `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ?`;
    app_1.db.run(query, values, function (err) {
        if (err) {
            console.error('❌ Помилка оновлення налаштувань:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка оновлення налаштувань'
            });
        }
        res.json({
            success: true,
            data: { message: 'Налаштування оновлені' }
        });
    });
});
