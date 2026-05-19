import { createFileRoute } from "@tanstack/solid-router";
import Home from "#pages/home/home.tsx";
import { notFound } from "@tanstack/solid-router";
import { GetNoteError } from "#shared/api/services/note.ts";
import { queryClient } from "#shared/api/query-client.ts";
import { noteDetailQuery } from "#entities/note/api/queries/note-detail-query.ts";
import { RouterError } from "#app/router/router.ts";
import { setLastOpenedNoteId } from "#entities/note/api/last-opened-note.ts";

export const Route = createFileRoute("/notes/$id")({
  loader: async ({ params }) => {
    try {
      const note = await queryClient.ensureQueryData(
        noteDetailQuery.detail(params.id),
      );

      setLastOpenedNoteId(note.id);

      return note;
    } catch (e) {
      if (e instanceof GetNoteError && e.code === "NOTE_NOT_FOUND") {
        notFound({ throw: true });
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
  component: () => {
    const note = Route.useLoaderData();
    return <Home note={note()} />;
  },
});
