import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import relations from "./relations";

const sqlite = SQLite.openDatabaseSync("expenstack.db");
export const db = drizzle(sqlite, { relations });
