import { queryOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { getNote } from "#shared/api/services/note.ts";
import { noteQueryRoot } from "#entities/note/api/queries/note-all-query.ts";

type Success = Result.InferSuccess<typeof getNote>;
type Failure = Result.InferFailure<typeof getNote>;

export const noteQueryDetail = {
  allDetail: buildQueryKey({ ...noteQueryRoot.all[0], scope: "detail" }),
  detail: (id: string) =>
    queryOptions<Success, Failure>({
      queryKey: buildQueryKey({ ...noteQueryDetail.allDetail[0], id }),
      queryFn: async () => {
        const result = await getNote(id);

        return Result.unwrap(result);
      },
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
    }),
};
