import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";

export const noteQueryRoot = {
  all: buildQueryKey({ entity: "note" }),
};
