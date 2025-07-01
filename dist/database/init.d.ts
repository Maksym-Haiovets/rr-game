import sqlite3 from 'sqlite3';
export declare function getDatabase(): Promise<sqlite3.Database>;
export declare function initDatabase(): Promise<void>;
