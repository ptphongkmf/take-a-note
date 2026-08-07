import "@tanstack/solid-query";
import { MutationCache, QueryClient } from "@tanstack/solid-query";
import type {
  MutationKeyObjShape,
  QueryKeyObjShape,
} from "#shared/lib/tanstack-query/build-key.ts";
import { AppError } from "#shared/lib/errors/app-error.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
    },
  },
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      if (error instanceof AppError) {
        // TODO: toast app error
      } else if (error instanceof Error) {
        // TODO: toast generic error
      } else {
        // TODO: toast unknown error
      }
    },
  }),
});

declare module "@tanstack/solid-query" {
  interface Register {
    queryKey: readonly [QueryKeyObjShape];
    mutationKey: readonly [MutationKeyObjShape];
  }
}
