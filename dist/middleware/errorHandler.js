"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const ApiError_1 = require("../utils/ApiError");
function errorHandler(err, req, res, next) {
    console.error('❌ Error occurred:', err);
    if (err instanceof ApiError_1.ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
        return;
    }
    // SQLite errors
    if (err.code && err.code.startsWith('SQLITE_')) {
        res.status(500).json({
            success: false,
            error: 'Database error occurred',
            details: err.message
        });
        return;
    }
    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
}
//# sourceMappingURL=errorHandler.js.map