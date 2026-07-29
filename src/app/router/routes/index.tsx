import { createFileRoute } from "@tanstack/solid-router";
import { getLastOpenedNoteId } from "#entities/note/api/last-opened-note.ts";
import { redirect } from "@tanstack/solid-router";
import { monotonicUlid } from "@std/ulid/monotonic-ulid";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const noteId = getLastOpenedNoteId() ?? monotonicUlid();

    throw redirect({
      to: "/notes/$id",
      params: { id: noteId },
      replace: true,
    });
  },
});
