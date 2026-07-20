import { idbClient } from "#shared/storage/idb/idb-client.ts";
import { Result } from "@praha/byethrow";
import { IdbOperationError } from "#shared/storage/idb/errors.ts";
import { parseSchema } from "#shared/lib/schema/parse.ts";
import { AppError } from "#shared/lib/errors/app-error.ts";
import * as v from "@valibot/valibot";
import {
  EditorFormats,
  SerializedEditorStateSchema,
} from "#shared/editor/schema.ts";
import { vTrimNonEmptyString } from "#shared/lib/schema/string.ts";

const NoteDtoSchema = v.variant("isCorrupt", [
  v.object({
    id: vTrimNonEmptyString,
    title: v.string(),
    format: v.enum(EditorFormats),
    content: v.optional(SerializedEditorStateSchema),
    isCorrupt: v.literal(false),
    createdAt: v.pipe(
      v.number(),
      v.transform((input) => Temporal.Instant.fromEpochMilliseconds(input)),
    ),
    updatedAt: v.pipe(
      v.number(),
      v.transform((input) => Temporal.Instant.fromEpochMilliseconds(input)),
    ),
  }),
  v.object({
    id: vTrimNonEmptyString,
    title: v.unknown(),
    format: v.unknown(),
    content: v.unknown(),
    isCorrupt: v.literal(true),
    createdAt: v.unknown(),
    updatedAt: v.unknown(),
  }),
]);

export type NoteDto = v.InferOutput<typeof NoteDtoSchema>;
export type NoteDtoValid = Extract<NoteDto, { isCorrupt: false }>;
export type NoteDtoCorrupt = Extract<NoteDto, { isCorrupt: true }>;

type GetNoteErrorCode = "NOTE_GET_FAILED" | "NOTE_NOT_FOUND";

export class GetNoteError extends AppError<GetNoteErrorCode> {
  public override readonly name = "GetNoteError";
}

export function getNote(
  id: string,
): Result.ResultAsync<NoteDto, GetNoteError> {
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
      if (meta === undefined) {
        return Result.fail(
          new GetNoteError(`Note with id "${id}" not found`, {
            code: "NOTE_NOT_FOUND",
          }),
        );
      }

      return Result.succeed({ ...meta, content: content?.content });
    }),
    Result.andThen((noteDto) => {
      const result = parseSchema(NoteDtoSchema, noteDto);

      if (Result.isFailure(result)) {
        return Result.succeed({ ...noteDto, isCorrupt: true });
      }

      return result;
    }),
  );
}

type SaveNoteErrorCode = "NOTE_SAVE_FAILED";

export class SaveNoteError extends AppError<SaveNoteErrorCode> {
  public override readonly name = "SaveNoteError";
}

export function saveNote(
  note: NoteDtoValid,
): Result.ResultAsync<NoteDtoValid, SaveNoteError> {
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
const GC_MINIMUM_AGE = 24 * 60 * 60 * 1000;

export interface GcState {
  lastMetaId?: string;
  lastContentId?: string;
}

export function gcNote(state: GcState = {}) {
  return Result.try({
    try: async () => {
      const db = idbClient();
      const tx = db.transaction(["note_meta", "note_content"], "readwrite");

      const metaStore = tx.objectStore("note_meta");
      const contentStore = tx.objectStore("note_content");

      const MAX_META_SWEEP = Math.floor(GC_BATCH_SIZE / 2);
      const MAX_CONTENT_SWEEP = Math.floor(GC_BATCH_SIZE / 2);

      // SWEEP `note_meta` (Find empty, old, untouched notes)
      const metaRange = state.lastMetaId
        ? IDBKeyRange.lowerBound(state.lastMetaId, true)
        : undefined;

      let metaCursor = await metaStore.openCursor(metaRange)
        .catch((e) => {
          throw new IdbOperationError({
            action: "read",
            store: "note_meta",
            cause: e,
          });
        });

      let metaProcessedCount = 0;
      let latestMetaId = state.lastMetaId;

      while (metaCursor && metaProcessedCount < MAX_META_SWEEP) {
        const meta = metaCursor.value;
        latestMetaId = meta.id;

        const isTitleEmpty = meta.title.trim() === "";
        const isUntouched = meta.createdAt === meta.updatedAt;
        const isOldEnough = (Date.now() - meta.createdAt) > GC_MINIMUM_AGE;

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
            await metaCursor.delete().catch((e) => {
              throw new IdbOperationError({
                action: "delete",
                store: "note_meta",
                cause: e,
              });
            });
            await contentStore.delete(meta.id).catch((e) => {
              throw new IdbOperationError({
                action: "delete",
                store: "note_content",
                cause: e,
              });
            });
          }
        }

        metaProcessedCount++;
        metaCursor = await metaCursor.continue().catch((e) => {
          throw new IdbOperationError({
            action: "read",
            store: "note_meta",
            cause: e,
          });
        });
      }

      // SWEEP `note_content` (Find orphaned content)
      const contentRange = state.lastContentId
        ? IDBKeyRange.lowerBound(state.lastContentId, true)
        : undefined;

      let contentCursor = await contentStore.openCursor(contentRange)
        .catch((e) => {
          throw new IdbOperationError({
            action: "read",
            store: "note_content",
            cause: e,
          });
        });

      let contentProcessedCount = 0;
      let latestContentId = state.lastContentId;

      while (contentCursor && contentProcessedCount < MAX_CONTENT_SWEEP) {
        const contentKey = contentCursor.key;
        latestContentId = contentKey;

        const parentMetaKey = await metaStore.getKey(contentKey)
          .catch((e) => {
            throw new IdbOperationError({
              action: "read",
              store: "note_meta",
              cause: e,
            });
          });

        if (parentMetaKey === undefined) {
          await contentCursor.delete().catch((e) => {
            throw new IdbOperationError({
              action: "delete",
              store: "note_content",
              cause: e,
            });
          });
        }

        contentProcessedCount++;
        contentCursor = await contentCursor.continue().catch((e) => {
          throw new IdbOperationError({
            action: "read",
            store: "note_content",
            cause: e,
          });
        });
      }

      await tx.done;

      return {
        lastMetaId: metaCursor ? latestMetaId : undefined,
        lastContentId: contentCursor ? latestContentId : undefined,
      };
    },

    catch: (e) => {
      const idbError = e instanceof IdbOperationError
        ? e
        : new IdbOperationError(
          "Unknown error occurred while performing garbage collection",
          { code: "IDB_UNKNOWN_FAILURE", cause: e },
        );

      return new GarbageCollectNoteError(
        "Failed to garbage collect notes in IndexedDB",
        { code: "NOTE_GC_FAILED", cause: idbError },
      );
    },
  });
}
