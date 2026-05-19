import { createFileRoute } from "@tanstack/solid-router";
import { getLastOpenedNoteId } from "#entities/note/api/last-opened-note.ts";
import { redirect } from "@tanstack/solid-router";
import { saveNote } from "#shared/api/services/note.ts";
import { monotonicUlid } from "@std/ulid/monotonic-ulid";
import { Result } from "@praha/byethrow";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const lastOpenedId = getLastOpenedNoteId();
    if (lastOpenedId) {
      throw redirect({
        to: "/notes/$id",
        params: { id: lastOpenedId },
        replace: true,
      });
    }

    const note = await Result.unwrap(
      saveNote({
        id: monotonicUlid(),
        title: "",
        format: "plain-text",
        isCorrupt: false,
        createdAt: Temporal.Now.instant(),
        updatedAt: Temporal.Now.instant(),
      }),
    );

    throw redirect({
      to: "/notes/$id",
      params: { id: note.id },
      replace: true,
    });
  },
});
