"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const init_1 = require("./database/init");
const errorHandler_1 = require("./middleware/errorHandler");
const positions_1 = require("./routes/positions");
const settings_1 = require("./routes/settings");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Global database instance
let database;
// Initialize application
async function initializeApp() {
    try {
        console.log('🚀 Initializing application...');
        // Initialize database first
        database = await (0, init_1.getDatabase)();
        console.log('✅ Database initialized successfully');
        // Setup routes with database instance
        app.use('/api/positions', (0, positions_1.createPositionsRouter)(database));
        app.use('/api/settings', (0, settings_1.createSettingsRouter)(database));
        // Error handling middleware (should be last)
        app.use(errorHandler_1.errorHandler);
        console.log('✅ Routes configured');
    }
    catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
}
// Start server only after initialization
async function startServer() {
    try {
        await initializeApp();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
            console.log(`📊 API доступне на http://localhost:${PORT}/api`);
        });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n📥 Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                console.log('🔒 HTTP server closed');
            });
            if (database) {
                await database.close();
            }
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Start the application
startServer().catch((error) => {
    console.error('❌ Unhandled error during startup:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map