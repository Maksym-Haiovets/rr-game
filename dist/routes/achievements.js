"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.achievementsRouter = void 0;
const express_1 = require("express");
const app_1 = require("../app");
exports.achievementsRouter = (0, express_1.Router)();
// Отримати всі досягнення
exports.achievementsRouter.get('/', (req, res) => {
    app_1.db.all('SELECT * FROM achievements ORDER BY id', (err, rows) => {
        if (err) {
            console.error('❌ Помилка отримання досягнень:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка отримання досягнень'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});
// Розблокувати досягнення
exports.achievementsRouter.put('/:code', (req, res) => {
    const { code } = req.params;
    app_1.db.run('UPDATE achievements SET unlocked = 1, unlocked_at = CURRENT_TIMESTAMP WHERE code = ? AND unlocked = 0', [code], function (err) {
        if (err) {
            console.error('❌ Помилка розблокування досягнення:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка розблокування досягнення'
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Досягнення не знайдено або вже розблоковано'
            });
        }
        res.json({
            success: true,
            data: { code, unlocked: true }
        });
    });
});
// Скинути всі досягнення (для тестування)
exports.achievementsRouter.post('/reset', (req, res) => {
    app_1.db.run('UPDATE achievements SET unlocked = 0, unlocked_at = NULL', (err) => {
        if (err) {
            console.error('❌ Помилка скидання досягнень:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка скидання досягнень'
            });
        }
        res.json({
            success: true,
            data: { message: 'Всі досягнення скинуті' }
        });
    });
});
