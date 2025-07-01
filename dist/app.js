"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const init_1 = require("./database/init");
const positions_1 = require("./routes/positions");
const settings_1 = require("./routes/settings");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
async function startServer() {
    try {
        console.log('🔧 Ініціалізація бази даних...');
        exports.db = await (0, init_1.initDatabase)();
        console.log('✅ База даних готова');
        // Маршрути API
        app.use('/api/positions', positions_1.positionsRouter);
        app.use('/api/settings', settings_1.settingsRouter);
        // Обробка помилок
        app.use((err, req, res, next) => {
            console.error('❌ Помилка сервера:', err);
            res.status(500).json({
                success: false,
                error: 'Внутрішня помилка сервера'
            });
        });
        // Запуск сервера
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
            console.log(`📊 API доступне на http://localhost:${PORT}/api`);
        });
        // Graceful shutdown
        const gracefulShutdown = () => {
            console.log('\n🔄 Зупинка сервера...');
            if (exports.db) {
                exports.db.close((err) => {
                    if (err) {
                        console.error('❌ Помилка при закритті БД:', err);
                    }
                    else {
                        console.log('✅ База даних закрита');
                    }
                    process.exit(0);
                });
            }
            else {
                process.exit(0);
            }
        };
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    }
    catch (error) {
        console.error('💥 Критична помилка запуску:', error);
        process.exit(1);
    }
}
startServer();
