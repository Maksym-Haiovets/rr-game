"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const init_1 = require("./database/init");
const positions_1 = __importDefault(require("./routes/positions"));
const settings_1 = __importDefault(require("./routes/settings"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// API Routes
app.use('/api/positions', positions_1.default);
app.use('/api/settings', settings_1.default);
// Serve the main page for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Initialize database and start server
async function startServer() {
    try {
        await (0, init_1.initDatabase)();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
        });
        // Додай цей блок тут ▼▼▼
        process.on('SIGINT', async () => {
            console.log('🛑 Отримано сигнал SIGINT. Зупиняємо сервер...');
            server.close(async () => {
                console.log('🔒 Сервер зупинено. Закриваємо зʼєднання з БД...');
                const db = await (0, init_1.getDatabase)();
                db.close(() => {
                    console.log('✅ Зʼєднання з БД закрито');
                    process.exit(0);
                });
            });
        });
        // ▲▲▲ Кінець нового коду
    }
    catch (error) {
        console.error('❌ Помилка запуску сервера:', error);
        process.exit(1);
    }
}
startServer();
