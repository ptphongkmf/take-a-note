import { createFileRoute } from "@tanstack/solid-router";
import Home from "#pages/home/home.tsx";
import { queryClient } from "#shared/api/query-client.ts";
import {
  noteQueryDetailOrDefault,
} from "#entities/note/api/queries/note-detail-or-default-query.ts";
import { setLastOpenedNoteId } from "#entities/note/api/last-opened-note.ts";
import { noteQueryList } from "#entities/note/api/queries/note-list-query.ts";

export const Route = createFileRoute("/notes/$id")({
  loader: async ({ params }) => {
    queryClient.prefetchQuery(noteQueryList());

    await queryClient.fetchQuery(noteQueryDetailOrDefault(params.id))
      .catch(/* ignore */);

    setLastOpenedNoteId(params.id);
  },
  component: Home,
});
