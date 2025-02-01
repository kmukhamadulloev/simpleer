// db/templates/migration.template.js
export const migrationTemplate = `import database from "../database.js";
const db = database.getConnection();

export async function up() {
  await db.runAsync('BEGIN TRANSACTION');
  try {
    // Your migration SQL here
    await db.runAsync(\`
      -- Example: CREATE TABLE IF NOT EXISTS users (...)
    \`);
    await db.runAsync('COMMIT');
  } catch (err) {
    await db.runAsync('ROLLBACK');
    throw err;
  }
}

export async function down() {
  await db.runAsync('BEGIN TRANSACTION');
  try {
    // Your rollback SQL here
    await db.runAsync(\`
      -- Example: DROP TABLE IF EXISTS users
    \`);
    await db.runAsync('COMMIT');
  } catch (err) {
    await db.runAsync('ROLLBACK');
    throw err;
  }
}
`;