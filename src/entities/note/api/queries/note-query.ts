import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";

export const noteQueryKey = {
  all: () => buildQueryKey({ entity: "note" }),
};
