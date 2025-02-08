import fs from "fs/promises";
import db from "./database.js";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// const fs = require('fs/promises');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class Migrator {
  constructor() {
    this.migrationsDir = path.join(__dirname, "migrations");
  }

  async up() {
    await this.#getMigrationTableExist();
    const executed = await this.#getExecutedMigrations();
    const files = await this.#getMigrationFiles();

    for (const file of files) {
      if (!executed.includes(file)) {
        await this.#runMigration(file, "up");
      }
    }
  }

  async down() {
    const executed = await this.#getExecutedMigrations();
    const files = (await this.#getMigrationFiles()).reverse();

    for (const file of files) {
      if (executed.includes(file)) {
        await this.#runMigration(file, "down");
      }
    }
  }

  async create(name) {
    name = name?.trim();
    if (!name) throw new Error("Migration name is required!");

    const files = this.#getMigrationFiles();
    const lastNumber =
      files.length > 0
        ? parseInt(files[files.length - 1].substring(0, 3), 10)
        : 0;
    const nextNumber = String(lastNumber + 1).padStart(3, "0");

    const template = (await import("./templates/migration.template.js"))
      .migrationTemplate;
    const fileName = `${nextNumber}_${name}.js`;
    const filePath = path.join(this.migrationsDir, fileName);

    fs.writeFile(filePath, template);
    console.log(`✅ Migration created: ${fileName}`);
  }

  // --- Private Methods ---
  async #getMigrationTableExist() {
    const exist = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    ).all();

    if (exist.length === 0) {
      await this.#runMigration('001_create_migration_table.js', 'up')
    }
  }

  async #getMigrationFiles() {
    const files = await fs.readdir(this.migrationsDir);
    return files.filter(file => file.endsWith('.js')).sort();
  }

  async #getExecutedMigrations() {
    const rows = db.prepare("SELECT name FROM migrations ORDER BY name");
    return rows.all().map((row) => row.name);
  }

  async #runMigration(file, direction) {
    const module = pathToFileURL(path.join(this.migrationsDir, file)).href;
    const { up, down } = await import(module);
    const action = direction === "up" ? up : down;

    try {
      await action();
      if (direction === "up") {
        const query = db.prepare("INSERT INTO migrations (name) VALUES (?)");
        query.run(file);
        
        console.log(`✅ Applied: ${file}`);
      } else {
        const query = db.prepare("DELETE FROM migrations WHERE name = (?)");
        query.run(file);

        console.log(`↩️ Rolled back: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Migration failed (${file}):`, err.message);
      throw err;
    }
  }
}
