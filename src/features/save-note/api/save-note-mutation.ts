import { mutationOptions } from "@tanstack/solid-query";
import { Result } from "@praha/byethrow";
import { buildMutationKey } from "#shared/lib/tanstack-query/build-key.ts";
import { type NoteDtoValid, saveNote } from "#shared/api/services/note.ts";

type Success = Result.InferSuccess<typeof saveNote>;
type Failure = Result.InferFailure<typeof saveNote>;

export const saveNoteMutation = mutationOptions<
  Success,
  Failure,
  NoteDtoValid
>({
  mutationKey: buildMutationKey({ entity: "note", action: "save" }),
  mutationFn: async (note: NoteDtoValid) => {
    const result = await saveNote(note);

    return Result.unwrap(result);
  },
  onSuccess: (_d, _v, _omr, _context) => {
    // TODO: Invalidate only the relevant queries
    // context.client.invalidateQueries();
  },
});
