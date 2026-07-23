import { useMutation } from "@tanstack/solid-query";
import { noteMutationSave } from "#features/save-note/api/save-note-mutation.ts";
import type { Accessor } from "solid-js";
import type { NoteDtoValid } from "#shared/api/services/note.ts";
import { debounce } from "@std/async/debounce";
import { createEffect } from "solid-js";
import { on } from "solid-js";
import { onCleanup } from "solid-js";

interface SaveNoteManagerParams {
  isDirty: Accessor<boolean>;
  lastChangedAt: Accessor<Temporal.Instant>;
  triggerFormSubmit: () => void;
  onSaveSuccess?: (savedNote: NoteDtoValid) => void;
}

export default function createSaveNoteManager(params: SaveNoteManagerParams) {
  let pendingSavePayload: NoteDtoValid | undefined = undefined;

  const saveMutation = useMutation(() => noteMutationSave);

  const debouncedSave = debounce(() => {
    params.triggerFormSubmit();
  }, 3000);

  function executeSave(payload: NoteDtoValid) {
    if (saveMutation.isPending) {
      pendingSavePayload = payload;
      return;
    }

    saveMutation.mutate(payload, {
      onSuccess: (data) => {
        params.onSaveSuccess?.(data);
      },
      onSettled: () => {
        if (pendingSavePayload) {
          const nextPayload = pendingSavePayload;
          pendingSavePayload = undefined;
          executeSave(nextPayload);
        }
      },
    });
  }

  createEffect(on(() => [params.lastChangedAt(), params.isDirty()], () => {
    if (params.isDirty()) {
      debouncedSave();
    } else {
      debouncedSave.clear();
    }
  }));

  createEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (params.isDirty()) {
        e.preventDefault();
      }
    }

    globalThis.addEventListener("beforeunload", handleBeforeUnload);

    onCleanup(() =>
      globalThis.removeEventListener("beforeunload", handleBeforeUnload)
    );
  });

  onCleanup(() => {
    if (params.isDirty()) {
      debouncedSave.flush();
    } else {
      debouncedSave.clear();
    }
  });

  return {
    executeSave,
    cancelAutosave: () => debouncedSave.clear(),
    isSaving: () => saveMutation.isPending,
  };
}
