import database from "../database.js";
const db = database.getConnection();

export async function up() {
  await db.runAsync("BEGIN TRANSACTION");
  try {
    // Your migration SQL here
    await db.runAsync(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);
    await db.runAsync("COMMIT");
  } catch (err) {
    await db.runAsync("ROLLBACK");
    throw err;
  }
}

export async function down() {
  await db.runAsync("BEGIN TRANSACTION");
  try {
    // Your rollback SQL here
    await db.runAsync(`
      DROP TABLE IF EXISTS gallery
    `);
    await db.runAsync("COMMIT");
  } catch (err) {
    await db.runAsync("ROLLBACK");
    throw err;
  }
}
