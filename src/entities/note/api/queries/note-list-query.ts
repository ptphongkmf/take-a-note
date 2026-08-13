import { Result } from "@praha/byethrow";
import {
  type listNoteFiltersOpts,
  listNotes,
} from "#shared/api/services/note.ts";
import { buildQueryKey } from "#shared/lib/tanstack-query/build-key.ts";
import { noteQueryKey } from "#entities/note/api/queries/note-query.ts";
import { queryOptions } from "@tanstack/solid-query";
import type { NoteList } from "#entities/note/model/note.ts";
import { safeStringify } from "#shared/lib/string/safe-stringify.ts";
import { EditorFormatsSafeSchema } from "#shared/editor/schema.ts";
import * as v from "@valibot/valibot";
import { parseTemporal } from "#shared/lib/datetime/parse.ts";

export const noteQueryListKey = {
  all: () => buildQueryKey({ ...noteQueryKey.all()[0], scope: "list" }),
  list: (filters?: listNoteFiltersOpts) =>
    buildQueryKey({ ...noteQueryListKey.all()[0], params: filters }),
};

type Failure = Result.InferFailure<typeof listNotes>;

export function noteQueryList(filters?: listNoteFiltersOpts) {
  return queryOptions<NoteList[], Failure>({
    queryKey: noteQueryListKey.list(filters),
    queryFn: async () => {
      const result = Result.unwrap(await listNotes(filters));

      const normalizedResult: NoteList[] = [];
      for (const noteMeta of result) {
        if (noteMeta.isCorrupt) {
          const rawCreatedAt = noteMeta.createdAt;
          const rawUpdatedAt = noteMeta.updatedAt;

          let safeCreatedAt: Temporal.Instant | undefined;
          if (typeof rawCreatedAt === "number") {
            const createdAtResult = parseTemporal(() =>
              Temporal.Instant.fromEpochMilliseconds(rawCreatedAt)
            );

            if (Result.isSuccess(createdAtResult)) {
              safeCreatedAt = createdAtResult.value;
            }
          }

          let safeUpdatedAt: Temporal.Instant | undefined;
          if (typeof rawUpdatedAt === "number") {
            const updatedAtResult = parseTemporal(() =>
              Temporal.Instant.fromEpochMilliseconds(rawUpdatedAt)
            );

            if (Result.isSuccess(updatedAtResult)) {
              safeUpdatedAt = updatedAtResult.value;
            }
          }

          normalizedResult.push({
            id: noteMeta.id,
            title: safeStringify(noteMeta.title),
            format: v.parse(EditorFormatsSafeSchema, noteMeta.format),
            isCorrupt: noteMeta.isCorrupt,
            createdAt: safeCreatedAt,
            updatedAt: safeUpdatedAt,
          });
        } else {
          normalizedResult.push(noteMeta);
        }
      }

      return normalizedResult;
    },
  });
}
