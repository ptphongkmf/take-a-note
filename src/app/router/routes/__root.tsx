import { createRootRoute } from "@tanstack/solid-router";
import RootLayout from "#app/layouts/root-layout.tsx";
import { RootNotFound } from "#pages/not-found/root-not-found.tsx";
import RootFatalError from "#pages/fatal-error/root-fatal-error.tsx";
import { initIndexedDB } from "#shared/storage/idb/idb-client.ts";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "#shared/api/query-client.ts";
import { onMount } from "solid-js";
import { gcNote } from "#shared/api/services/note.ts";
import { Result } from "@praha/byethrow";

export const Route = createRootRoute({
  beforeLoad: async () => {
    await initIndexedDB();
  },
  component: () => {
    onMount(() => {
      async function runNoteGarbageCollector(startId?: string) {
        console.log("gb ran");
        const gcResult = await gcNote(startId);

        if (Result.isFailure(gcResult)) {
          // TODO: call toast here
          console.log("error?: " + gcResult.error);
          return;
        }

        const nextId = Result.unwrap(gcResult);
        if (nextId) {
          globalThis.requestIdleCallback(() => runNoteGarbageCollector(nextId));
        }
        // else, no more batches!
      }

      // globalThis.requestIdleCallback(() => runNoteGarbageCollector());
    });

    return (
      <QueryClientProvider client={queryClient}>
        <RootLayout />
      </QueryClientProvider>
    );
  },
  notFoundComponent: RootNotFound,
  errorComponent: RootFatalError,
});
