import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";

export const noteAllQuery = {
  all: buildQueryKey({ entity: "note" }),
};
