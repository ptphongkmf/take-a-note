import { createFileRoute, redirect } from "@tanstack/solid-router";
import { clearLastOpenedNoteId } from "#entities/note/api/last-opened-note.ts";

export const Route = createFileRoute("/notes/new")({
  beforeLoad: () => {
    clearLastOpenedNoteId();

    throw redirect({ to: "/", replace: true });
  },
});
