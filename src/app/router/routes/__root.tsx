import { createRootRoute } from "@tanstack/solid-router";
import RootLayout from "#app/layouts/root-layout.tsx";
import RootNotFound from "#pages/not-found/root-not-found.tsx";
import RootFatalError from "#pages/fatal-error/root-fatal-error.tsx";
import { initIndexedDB } from "#shared/storage/idb/idb-client.ts";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "#shared/api/query-client.ts";
import { onMount } from "solid-js";
import { gcNote } from "#shared/api/services/note.ts";
import { Result } from "@praha/byethrow";
import type { GcState } from "#shared/api/services/note.ts";

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (!globalThis.Temporal) {
      await import("temporal-polyfill/global");
    }

    await initIndexedDB();
  },
  component: () => {
    onMount(() => {
      async function runNoteGarbageCollector(state: GcState = {}) {
        const gcResult = await gcNote(state);

        if (Result.isFailure(gcResult)) {
          // TODO: remove log and call toast here
          console.log("error?: " + gcResult.error);
          return;
        }

        const nextState = Result.unwrap(gcResult);
        if (nextState.lastMetaId || nextState.lastContentId) {
          globalThis.requestIdleCallback(() =>
            runNoteGarbageCollector(nextState)
          );
        }
        // else, no more batches!
      }

      globalThis.requestIdleCallback(() => runNoteGarbageCollector());
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
