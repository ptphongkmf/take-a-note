import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";

export const noteRootQueryFactory = {
  all: buildQueryKey({ entity: "note" }),
};
