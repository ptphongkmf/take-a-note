import { Result } from "@praha/byethrow";
import {
  type listNoteFiltersOpts,
  listNotes,
} from "#shared/api/services/note.ts";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { noteQueryKey } from "#entities/note/api/queries/note-query.ts";
import { queryOptions } from "@tanstack/solid-query";

export const noteQueryListKey = {
  all: () => buildQueryKey({ ...noteQueryKey.all()[0], scope: "list" }),
  list: (filters?: listNoteFiltersOpts) =>
    buildQueryKey({ ...noteQueryListKey.all()[0], params: filters }),
};

type Success = Result.InferSuccess<typeof listNotes>;
type Failure = Result.InferFailure<typeof listNotes>;

export function noteQueryList(filters?: listNoteFiltersOpts) {
  return queryOptions<Success, Failure>({
    queryKey: noteQueryListKey.list(filters),
    queryFn: async () => {
      const result = await listNotes(filters);

      return Result.unwrap(result);
    },
  });
}
