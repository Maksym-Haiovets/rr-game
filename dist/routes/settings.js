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
    const updates = [];
    const values = [];
    // Перевірка та додавання полів для оновлення
    if (req.body.risk_per_position !== undefined) {
        const risk = parseFloat(req.body.risk_per_position);
        if (risk < 0.1 || risk > 10) {
            return res.status(400).json({
                success: false,
                error: 'Ризик має бути від 0.1% до 10%'
            });
        }
        updates.push('risk_per_position = ?');
        values.push(risk);
    }
    if (req.body.reward_ratio !== undefined) {
        const reward = parseFloat(req.body.reward_ratio);
        if (reward < 1 || reward > 5) {
            return res.status(400).json({
                success: false,
                error: 'Співвідношення прибутку має бути від 1 до 5'
            });
        }
        updates.push('reward_ratio = ?');
        values.push(reward);
    }
    if (req.body.tutorial_completed !== undefined) {
        updates.push('tutorial_completed = ?');
        values.push(req.body.tutorial_completed ? 1 : 0);
    }
    if (req.body.tutorial_skipped_forever !== undefined) {
        updates.push('tutorial_skipped_forever = ?');
        values.push(req.body.tutorial_skipped_forever ? 1 : 0);
    }
    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Немає даних для оновлення'
        });
    }
    values.push(1); // id = 1
    const sql = `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ?`;
    app_1.db.run(sql, values, function (err) {
        if (err) {
            console.error('❌ Помилка оновлення налаштувань:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка оновлення налаштувань'
            });
        }
        res.json({
            success: true,
            data: { message: 'Налаштування оновлені', changes: this.changes }
        });
    });
});
