import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

const sqlite = SQLite.openDatabaseSync("expenstack.db", {
  enableChangeListener: true,
});
export const db = drizzle(sqlite);
