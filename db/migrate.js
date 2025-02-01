// db/migrate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import database from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = database.getConnection();

export class Migrator {
  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
  }

  async up() {
    await this.#ensureMigrationsTable();
    const executed = await this.#getExecutedMigrations();
    const files = this.#getMigrationFiles();

    for (const file of files) {
      if (!executed.includes(file)) {
        await this.#runMigration(file, 'up');
      }
    }
  }

  async down() {
    const executed = await this.#getExecutedMigrations();
    const files = this.#getMigrationFiles().reverse();

    for (const file of files) {
      if (executed.includes(file)) {
        await this.#runMigration(file, 'down');
      }
    }
  }

  async create(name) {
    name = name?.trim();
    if (!name) throw new Error('Migration name is required!');

    const files = this.#getMigrationFiles();
    const lastNumber = files.length > 0 ? 
      parseInt(files[files.length - 1].substring(0, 3), 10) : 0;
    const nextNumber = String(lastNumber + 1).padStart(3, '0');

    const template = (await import('./templates/migration.template.js')).migrationTemplate;
    const fileName = `${nextNumber}_${name}.js`;
    const filePath = path.join(this.migrationsDir, fileName);

    fs.writeFileSync(filePath, template);
    console.log(`✅ Migration created: ${fileName}`);
  }

  // --- Private Methods ---
  #getMigrationFiles() {
    return fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();
  }

  async #ensureMigrationsTable() {
    const tableExists = await db.getAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    );
    if (!tableExists) {
      await db.runAsync(`
        CREATE TABLE migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  }

  async #getExecutedMigrations() {
    const rows = await db.allAsync('SELECT name FROM migrations ORDER BY name');
    return rows.map(row => row.name);
  }

  async #runMigration(file, direction) {
    const { up, down } = await import(`file://${path.join(this.migrationsDir, file)}`);
    const action = direction === 'up' ? up : down;

    try {
      await action();
      if (direction === 'up') {
        await db.runAsync('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`✅ Applied: ${file}`);
      } else {
        await db.runAsync('DELETE FROM migrations WHERE name = ?', [file]);
        console.log(`↩️ Rolled back: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Migration failed (${file}):`, err.message);
      throw err;
    }
  }
}