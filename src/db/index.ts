import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

// (function purge() {
//   SQLite.deleteDatabaseSync("expenstack.db");
//   SQLite.deleteDatabaseSync("db.db");
// })();

const sqlite = SQLite.openDatabaseSync("expenstack.db", {
  enableChangeListener: true,
});

export const db = drizzle(sqlite);
