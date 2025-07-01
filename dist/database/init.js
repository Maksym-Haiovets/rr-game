"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlite3 = exports.Database = void 0;
exports.getDatabase = getDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
exports.sqlite3 = sqlite3_1.default;
const path_1 = __importDefault(require("path"));
class Database {
    constructor(dbPath = 'database.db') {
        this.db = null;
        this.dbPath = path_1.default.resolve(dbPath);
    }
    // Initialize database with proper async/await pattern
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3_1.default.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Error opening database:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Connected to SQLite database:', this.dbPath);
                // Use serialize to ensure tables are created in order
                this.db.serialize(() => {
                    this.createTables()
                        .then(() => {
                        console.log('✅ Database tables created/verified');
                        resolve();
                    })
                        .catch(reject);
                });
            });
        });
    }
    // Create tables with proper async/await and error handling
    async createTables() {
        const createPositionsTable = `
      CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY,
        result TEXT DEFAULT 'none' CHECK(result IN ('none', 'take', 'stop'))
      )
    `;
        const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        risk_per_position REAL DEFAULT 1.0,
        reward_ratio REAL DEFAULT 2.0,
        tutorial_completed BOOLEAN DEFAULT 0,
        tutorial_skipped_forever BOOLEAN DEFAULT 0
      )
    `;
        const insertDefaultPositions = `
      INSERT OR IGNORE INTO positions (id, result) VALUES
      (1, 'none'), (2, 'none'), (3, 'none'), (4, 'none'), (5, 'none'),
      (6, 'none'), (7, 'none'), (8, 'none'), (9, 'none'), (10, 'none'),
      (11, 'none'), (12, 'none'), (13, 'none'), (14, 'none'), (15, 'none')
    `;
        const insertDefaultSettings = `
      INSERT OR IGNORE INTO user_settings (id, risk_per_position, reward_ratio, tutorial_completed, tutorial_skipped_forever)
      VALUES (1, 1.0, 2.0, 0, 0)
    `;
        try {
            // Create tables first
            await this.runQuery(createPositionsTable);
            await this.runQuery(createSettingsTable);
            // Then insert default data
            await this.runQuery(insertDefaultPositions);
            await this.runQuery(insertDefaultSettings);
            console.log('✅ All tables and default data created successfully');
        }
        catch (error) {
            console.error('❌ Error creating tables:', error);
            throw error;
        }
    }
    // Promisified run method
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.error('❌ SQL Error:', err.message);
                    console.error('❌ Query:', sql);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // Get all positions
    async getAllPositions() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.all('SELECT * FROM positions ORDER BY id', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    // Update position
    async updatePosition(id, result) {
        return this.runQuery('UPDATE positions SET result = ? WHERE id = ?', [result, id]);
    }
    // Reset all positions
    async resetAllPositions() {
        return this.runQuery('UPDATE positions SET result = ?', ['none']);
    }
    // Get settings
    async getSettings() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.get('SELECT * FROM user_settings WHERE id = 1', (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    // Update settings
    async updateSettings(settings) {
        const fields = Object.keys(settings).map(key => `${key} = ?`).join(', ');
        const values = Object.values(settings);
        return this.runQuery(`UPDATE user_settings SET ${fields} WHERE id = 1`, values);
    }
    // Close database connection
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                    }
                    else {
                        console.log('✅ Database connection closed');
                    }
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    // Get database instance (for direct access if needed)
    getDb() {
        return this.db;
    }
}
exports.Database = Database;
// Singleton pattern for database instance
let databaseInstance = null;
async function getDatabase() {
    if (!databaseInstance) {
        databaseInstance = new Database();
        await databaseInstance.initialize();
    }
    return databaseInstance;
}
//# sourceMappingURL=init.js.map