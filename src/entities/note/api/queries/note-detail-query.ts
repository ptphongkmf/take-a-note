import { queryOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { getNote } from "#shared/api/services/note.ts";
import { noteAllQuery } from "#entities/note/api/queries/note-all-query.ts";

type Success = Result.InferSuccess<typeof getNote>;
type Failure = Result.InferFailure<typeof getNote>;

export const noteDetailQuery = {
  allDetail: buildQueryKey({ ...noteAllQuery.all[0], scope: "detail" }),
  detail: (id: string) => {
    return queryOptions<Success, Failure>({
      queryKey: buildQueryKey({ ...noteDetailQuery.allDetail[0], id }),
      queryFn: async () => {
        const result = await getNote(id);

        // TODO: handle validation error, will have to do with isCorrupt state...
        return Result.unwrap(result);
      },
      throwOnError: true,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
    });
  },
};
