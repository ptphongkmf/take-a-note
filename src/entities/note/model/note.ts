import type { EditorFormat } from "#shared/editor/schema.ts";

export interface NoteList {
  id: string;
  title: string;
  format: EditorFormat;
  isCorrupt: boolean;
  createdAt: Temporal.Instant | undefined;
  updatedAt: Temporal.Instant | undefined;
}
