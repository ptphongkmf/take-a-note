import type { IDBPDatabase } from "idb";

/**
 * Expected schema after applying version 1:
 *
 * **noteMeta:**
 * - `noteId` string (ULID), primary key
 * - `mode` string, "plain-text" | "markdown" | "rich-text"
 * - `title` string
 * - `createdAt` string (iso datetime)
 * - `updatedAt` string (iso datetime)
 *
 * **noteContent:**
 * - `noteId` string (ULID), primary key
 * - `content` object (Lexical AST)
 */
export function runInitialSchema(db: IDBPDatabase) {
  const noteStore = db.createObjectStore("note_meta", { keyPath: "id" });
  noteStore.createIndex("updatedAt", "updatedAt");

  db.createObjectStore("note_content", { keyPath: "noteId" });
}
