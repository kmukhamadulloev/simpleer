import database from "../database.js";
const db = database.getConnection();

export async function up() {
  await db.runAsync("BEGIN TRANSACTION");
  try {
    // Your migration SQL here
    await db.runAsync(`
    CREATE TABLE IF NOT EXISTS posts(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tags TEXT NOT NULL,
      content TEXT,
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
    await db.runAsync("DROP TABLE IF EXISTS posts");
    await db.runAsync("COMMIT");
  } catch (err) {
    await db.runAsync("ROLLBACK");
    throw err;
  }
}
