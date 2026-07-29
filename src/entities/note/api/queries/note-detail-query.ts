import { queryOptions, useQuery } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { getNote } from "#shared/api/services/note.ts";
import { noteQueryRoot } from "#entities/note/api/queries/note-all-query.ts";
import { isUlid } from "#shared/lib/ulid/is-ulid.ts";
import { createEmptyNote } from "#entities/note/model/create-empty-note.ts";

type Success = Result.InferSuccess<typeof getNote>;
type Failure = Result.InferFailure<typeof getNote>;

export const noteQueryDetail = {
  allDetailOrDefault: buildQueryKey({
    ...noteQueryRoot.all[0],
    scope: "detailOrDefault",
  }),
  detailOrDefault: (id: string) =>
    queryOptions<Success, Failure>({
      queryKey: buildQueryKey({ ...noteQueryDetail.allDetailOrDefault[0], id }),
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
    }),
};
