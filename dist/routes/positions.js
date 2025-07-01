"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionsRouter = void 0;
const express_1 = require("express");
const app_1 = require("../app");
exports.positionsRouter = (0, express_1.Router)();
// Отримати всі позиції
exports.positionsRouter.get('/', (req, res) => {
    app_1.db.all('SELECT * FROM positions ORDER BY id', (err, rows) => {
        if (err) {
            console.error('❌ Помилка отримання позицій:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка отримання позицій'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});
// Оновити позицію
exports.positionsRouter.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { result } = req.body;
    if (!['none', 'take', 'stop'].includes(result)) {
        return res.status(400).json({
            success: false,
            error: 'Некоректне значення result'
        });
    }
    if (id < 1 || id > 15) {
        return res.status(400).json({
            success: false,
            error: 'ID позиції має бути від 1 до 15'
        });
    }
    app_1.db.run('UPDATE positions SET result = ? WHERE id = ?', [result, id], function (err) {
        if (err) {
            console.error('❌ Помилка оновлення позиції:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка оновлення позиції'
            });
        }
        res.json({
            success: true,
            data: { id, result }
        });
    });
});
// Скинути всі позиції
exports.positionsRouter.post('/reset', (req, res) => {
    app_1.db.run('UPDATE positions SET result = ?', ['none'], (err) => {
        if (err) {
            console.error('❌ Помилка скидання позицій:', err);
            return res.status(500).json({
                success: false,
                error: 'Помилка скидання позицій'
            });
        }
        res.json({
            success: true,
            data: { message: 'Всі позиції скинуті' }
        });
    });
});
