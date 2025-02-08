import { DatabaseSync } from "node:sqlite";

class Database {
  #db;
  constructor() {
    this.#db = new DatabaseSync("./db/database.db");
  }

  getConnection() {
    return this.#db;
  }
}

export default (new Database()).getConnection();