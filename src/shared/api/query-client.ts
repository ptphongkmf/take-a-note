import "@tanstack/solid-query";
import { QueryClient } from "@tanstack/solid-query";
import type {
  MutationKeyObjShape,
  QueryKeyObjShape,
} from "#shared/lib/tanstack-query/build-key.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

declare module "@tanstack/solid-query" {
  interface Register {
    queryKey: readonly [QueryKeyObjShape];
    mutationKey: readonly [MutationKeyObjShape];
  }
}
