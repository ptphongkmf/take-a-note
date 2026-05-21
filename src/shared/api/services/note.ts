import { idbClient } from "#shared/storage/idb/idb-client.ts";
import { Result } from "@praha/byethrow";
import { IdbOperationError } from "#shared/storage/idb/errors.ts";
import { safeParse } from "#shared/lib/schema/parse.ts";
import { AppError } from "#shared/lib/errors/app-error.ts";
import * as v from "@valibot/valibot";
import {
  EditorFormats,
  SerializedEditorStateSchema,
} from "#shared/editor/schema.ts";
import { vTrimNonEmptyString } from "#shared/lib/schema/string.ts";

const NoteDtoSchema = v.object({
  id: vTrimNonEmptyString,
  title: v.string(),
  format: v.enum(EditorFormats),
  content: v.optional(SerializedEditorStateSchema),
  isCorrupt: v.boolean(),
  createdAt: v.pipe(
    v.number(),
    v.transform((input) => Temporal.Instant.fromEpochMilliseconds(input)),
  ),
  updatedAt: v.pipe(
    v.number(),
    v.transform((input) => Temporal.Instant.fromEpochMilliseconds(input)),
  ),
});
export type NoteDtoOutput = v.InferOutput<typeof NoteDtoSchema>;

type GetNoteErrorCode =
  | "NOTE_GET_FAILED"
  | "NOTE_NOT_FOUND"
  | "NOTE_VALIDATION_FAILED";

export class GetNoteError extends AppError<GetNoteErrorCode> {
  public override readonly name = "GetNoteError";
}

export function getNote(
  id: string,
): Result.ResultAsync<NoteDtoOutput, GetNoteError> {
  return Result.pipe(
    Result.try({
      try: async () => {
        const db = idbClient();

        const tx = db.transaction(["note_meta", "note_content"], "readonly");

        const metaPromise = tx.objectStore("note_meta").get(id)
          .catch((e) => {
            throw new IdbOperationError({
              action: "read",
              store: "note_meta",
              cause: e,
            });
          });

        const contentPromise = tx.objectStore("note_content").get(id)
          .catch((e) => {
            throw new IdbOperationError({
              action: "read",
              store: "note_content",
              cause: e,
            });
          });

        const [meta, content] = await Promise.all([
          metaPromise,
          contentPromise,
        ]);

        return { meta, content };
      },
      catch: (e) => {
        const idbError = e instanceof IdbOperationError
          ? e
          : new IdbOperationError(
            'Unknown error occurred while querying "note_meta" and "note_content" object store',
            { code: "IDB_UNKNOWN_FAILURE", cause: e },
          );

        return new GetNoteError(
          "Failed to retrieve the note from IndexedDB",
          { code: "NOTE_GET_FAILED", cause: idbError },
        );
      },
    }),
    Result.andThen(({ meta, content }) => {
      if (meta === undefined && content === undefined) {
        return Result.fail(
          new GetNoteError(`Note with id "${id}" not found`, {
            code: "NOTE_NOT_FOUND",
          }),
        );
      }

      return Result.succeed({ ...meta, content: content?.content });
    }),
    Result.andThen((noteDto) => safeParse(NoteDtoSchema, noteDto)),
    Result.mapError((e) => {
      if (e.name === "ValidationError") {
        return new GetNoteError(
          "Failed to retrieve the note from IndexedDB",
          { code: "NOTE_VALIDATION_FAILED", cause: e },
        );
      }

      return e;
    }),
  );
}

type SaveNoteErrorCode = "NOTE_SAVE_FAILED";

export class SaveNoteError extends AppError<SaveNoteErrorCode> {
  public override readonly name = "SaveNoteError";
}

export function saveNote(note: NoteDtoOutput): Result.ResultAsync<
  NoteDtoOutput,
  SaveNoteError
> {
  return Result.try({
    try: async () => {
      const metaToSave = {
        id: note.id,
        title: note.title,
        format: note.format,
        isCorrupt: note.isCorrupt,
        createdAt: note.createdAt.epochMilliseconds,
        updatedAt: note.updatedAt.epochMilliseconds,
      };

      const contentToSave = {
        noteId: note.id,
        content: note.content,
      };

      const db = idbClient();

      const tx = db.transaction(["note_meta", "note_content"], "readwrite");

      const metaPromise = tx.objectStore("note_meta").put(metaToSave)
        .catch((e) => {
          throw new IdbOperationError({
            action: "write",
            store: "note_meta",
            cause: e,
          });
        });

      const contentPromise = tx.objectStore("note_content").put(contentToSave)
        .catch((e) => {
          throw new IdbOperationError({
            action: "write",
            store: "note_content",
            cause: e,
          });
        });

      // Wait for the operations and the transaction to finish successfully
      await Promise.all([
        metaPromise,
        contentPromise,
        tx.done, // Ensures the transaction successfully commits
      ]);

      return note;
    },
    catch: (e) => {
      const idbError = e instanceof IdbOperationError
        ? e
        : new IdbOperationError(
          'Unknown error occurred while querying "note_meta" and "note_content" object store',
          { code: "IDB_UNKNOWN_FAILURE", cause: e },
        );

      return new SaveNoteError(
        "Failed to save the note to IndexedDB",
        { code: "NOTE_SAVE_FAILED", cause: idbError },
      );
    },
  });
}

type GarbageCollectNoteErrorCode = "NOTE_GC_FAILED";

export class GarbageCollectNoteError
  extends AppError<GarbageCollectNoteErrorCode> {
  public override readonly name = "GarbageCollectNoteError";
}

const GC_BATCH_SIZE = 2500;
const GC_MINIMUM_AGE = Temporal.Duration.from({ minutes: 0 }).total(
  "milliseconds",
);

export function gcNote(lastProcessedId?: string) {
  return Result.try({
    try: async () => {
      const db = idbClient();

      const tx = db.transaction(["note_meta", "note_content"], "readwrite");
      const metaStore = tx.objectStore("note_meta");
      const contentStore = tx.objectStore("note_content");

      const range = lastProcessedId
        ? IDBKeyRange.lowerBound(lastProcessedId, true)
        : undefined;

      let cursor = await metaStore.openCursor(range)
        .catch((e) => {
          throw new IdbOperationError({
            action: "read",
            store: "note_meta",
            cause: e,
          });
        });

      let processedCount = 0;
      let latestId = lastProcessedId;

      // Process the batch
      while (cursor && processedCount < GC_BATCH_SIZE) {
        const meta = cursor.value;
        latestId = meta.id;

        const isTitleEmpty = meta.title.trim() === "";
        const isUntouched = meta.createdAt === meta.updatedAt;
        const isOldEnough =
          (Temporal.Now.instant().epochMilliseconds - meta.createdAt) >
            GC_MINIMUM_AGE;

        if (isTitleEmpty && isUntouched && isOldEnough) {
          const contentRecord = await contentStore.get(meta.id)
            .catch((e) => {
              throw new IdbOperationError({
                action: "read",
                store: "note_content",
                cause: e,
              });
            });
          if (!contentRecord?.content) {
            await cursor.delete()
              .catch((e) => {
                throw new IdbOperationError({
                  action: "delete",
                  store: "note_meta",
                  cause: e,
                });
              });
            await contentStore.delete(meta.id)
              .catch((e) => {
                throw new IdbOperationError({
                  action: "delete",
                  store: "note_content",
                  cause: e,
                });
              });
          }
        }

        processedCount++;
        cursor = await cursor.continue()
          .catch((e) => {
            throw new IdbOperationError({
              action: "read",
              store: "note_meta",
              cause: e,
            });
          });
      }

      await tx.done;

      return cursor ? latestId : undefined;
    },
    catch: (e) => {
      const idbError = e instanceof IdbOperationError
        ? e
        : new IdbOperationError(
          'Unknown error occurred while querying "note_meta" and "note_content" object store',
          { code: "IDB_UNKNOWN_FAILURE", cause: e },
        );

      return new GarbageCollectNoteError(
        "Failed to save the note to IndexedDB",
        { code: "NOTE_GC_FAILED", cause: idbError },
      );
    },
  });
}
