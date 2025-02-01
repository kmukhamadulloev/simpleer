// db/database.js
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Database {
  static #instance;

  constructor() {
    if (Database.#instance) {
      throw new Error('Use Database.getInstance()!');
    }

    this.db = new sqlite3.Database(
      path.resolve(__dirname, 'database.db'),
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) throw new Error(`DB connection failed: ${err.message}`);
        console.log('Connected to SQLite database');
      }
    );

    // Promisify SQLite methods
    this.db.runAsync = promisify(this.db.run).bind(this.db);
    this.db.getAsync = promisify(this.db.get).bind(this.db);
    this.db.allAsync = promisify(this.db.all).bind(this.db);

    Database.#instance = this;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  getConnection() {
    return this.db;
  }
}

export default Database.getInstance();