import { createFileRoute } from "@tanstack/solid-router";
import Home from "#pages/home/home.tsx";
import { GetNoteError } from "#shared/api/services/note.ts";
import { queryClient } from "#shared/api/query-client.ts";
import { noteDetailQueryFactory } from "#entities/note/api/queries/note-detail-query.ts";
import { RouterError } from "#app/router/router.ts";
import {
  clearLastOpenedNoteId,
  setLastOpenedNoteId,
} from "#entities/note/api/last-opened-note.ts";
import { redirect } from "@tanstack/solid-router";
import { noteListQueryFactory } from "#entities/note/api/queries/note-list-query.ts";

export const Route = createFileRoute("/notes/$id")({
  loader: async ({ params }) => {
    queryClient.prefetchQuery(noteListQueryFactory.list());

    try {
      const note = await queryClient.ensureQueryData(
        noteDetailQueryFactory.detail(params.id),
      );

      setLastOpenedNoteId(note.id);

      return note;
    } catch (e) {
      if (e instanceof GetNoteError && e.code === "NOTE_NOT_FOUND") {
        // self-recovery, redirect to new notes instantly
        clearLastOpenedNoteId();
        throw redirect({
          to: "/",
          replace: true,
        });
      }

      throw new RouterError(
        `Unexpected error occurred while loading route: ${Route.path}`,
        {
          code: "UNKNOWN_ROUTER_FAILURE",
          cause: e,
        },
      );
    }
  },
  component: Home,
});
