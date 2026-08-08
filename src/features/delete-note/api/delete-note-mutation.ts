import { mutationOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildMutationKey } from "#shared/lib/tanstack-query/build-key.ts";
import { deleteNote } from "#shared/api/services/note.ts";

type Success = Result.InferSuccess<typeof deleteNote>;
type Failure = Result.InferFailure<typeof deleteNote>;

export const noteMutationDelete = mutationOptions<
  Success,
  Failure,
  string
>({
  mutationKey: buildMutationKey({ entity: "note", action: "delete" }),
  mutationFn: async (noteId: string) => {
    const result = await deleteNote(noteId);

    return Result.unwrap(result);
  },
});
