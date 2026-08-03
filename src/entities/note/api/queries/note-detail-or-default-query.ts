import { queryOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { getNote } from "#shared/api/services/note.ts";
import { noteQueryKey } from "#entities/note/api/queries/note-query.ts";
import { isUlid } from "#shared/lib/ulid/is-ulid.ts";
import { createEmptyNote } from "#entities/note/model/create-empty-note.ts";

export const noteQueryDetailOrDefaultKey = {
  all: () =>
    buildQueryKey({ ...noteQueryKey.all()[0], scope: "detailOrDefault" }),
  detailOrDefault: (id: string) =>
    buildQueryKey({ ...noteQueryDetailOrDefaultKey.all()[0], id }),
};

type Success = Result.InferSuccess<typeof getNote>;
type Failure = Result.InferFailure<typeof getNote>;

export function noteQueryDetailOrDefault(id: string) {
  return queryOptions<Success, Failure>({
    queryKey: noteQueryDetailOrDefaultKey.detailOrDefault(id),
    queryFn: async () => {
      const result = await getNote(id);

      if (
        Result.isFailure(result) && result.error.code === "NOTE_NOT_FOUND" &&
        isUlid(id)
      ) {
        return createEmptyNote(id);
      }

      return Result.unwrap(result);
    },
    gcTime: 30 * 60 * 1000,
  });
}
