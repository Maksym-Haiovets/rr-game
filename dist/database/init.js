"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initDatabase = initDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../database.db');
function getDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3_1.default.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(db);
            }
        });
    });
}
async function initDatabase() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create positions table
            db.run(`
        CREATE TABLE IF NOT EXISTS positions (
          id INTEGER PRIMARY KEY,
          result TEXT DEFAULT 'none'
        )
      `);
            // Create settings table
            db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY,
          risk_per_position REAL DEFAULT 1.0,
          reward_ratio REAL DEFAULT 2.0,
          tutorial_completed BOOLEAN DEFAULT 0,
          tutorial_skipped_forever BOOLEAN DEFAULT 0
        )
      `);
            // Initialize 15 positions if they don't exist
            db.get("SELECT COUNT(*) as count FROM positions", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row.count === 0) {
                    const stmt = db.prepare("INSERT INTO positions (id, result) VALUES (?, 'none')");
                    for (let i = 1; i <= 15; i++) {
                        stmt.run(i);
                    }
                    stmt.finalize();
                }
            });
            // Initialize default settings if they don't exist
            db.get("SELECT COUNT(*) as count FROM user_settings", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row.count === 0) {
                    db.run(`
            INSERT INTO user_settings (id, risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever)
            VALUES (1, 1.0, 2.0, 0, 0)
          `, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
                else {
                    resolve();
                }
            });
        });
    });
}
