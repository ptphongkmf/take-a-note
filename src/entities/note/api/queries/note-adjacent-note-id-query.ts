import { queryOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { getAdjacentNoteId } from "#shared/api/services/note.ts";
import { noteQueryKey } from "#entities/note/api/queries/note-query.ts";

export const noteQueryAdjacentNoteIdKey = {
  all: () =>
    buildQueryKey({ ...noteQueryKey.all()[0], scope: "adjacentNoteId" }),
  adjacentNoteId: (targetId: string) =>
    buildQueryKey({ ...noteQueryAdjacentNoteIdKey.all()[0], id: targetId }),
};

type Success = Result.InferSuccess<typeof getAdjacentNoteId>;
type Failure = Result.InferFailure<typeof getAdjacentNoteId>;

export function noteQueryAdjacentNoteId(targetId: string) {
  return queryOptions<Success, Failure>({
    queryKey: noteQueryAdjacentNoteIdKey.adjacentNoteId(targetId),
    queryFn: async () => {
      const result = await getAdjacentNoteId(targetId);

      return Result.unwrap(result);
    },
  });
}
