import { useMutation, useQueryClient } from "@tanstack/solid-query";
import {
  type ComponentProps,
  createContext,
  createMemo,
  createSignal,
  type ParentProps,
  splitProps,
  useContext,
} from "solid-js";
import { noteMutationDelete } from "#features/delete-note/api/delete-note-mutation.ts";
import { DeleteNoteConfirmDialog } from "#features/delete-note/ui/delete-note-confirm-dialog.tsx";
import { Button } from "#shared/ui/button/button.tsx";
import { Icon } from "#shared/ui/icon/icon.tsx";
import { c } from "#shared/lib/class-merger/c.ts";
import type { SelectedNote } from "#features/delete-note/model/selected-note.ts";
import { useNavigate } from "@tanstack/solid-router";
import { noteQueryAdjacentNoteId } from "#entities/note/api/queries/note-adjacent-note-id-query.ts";

interface DeleteNoteTargetContextValue {
  setSelectedNote: (note: SelectedNote) => void;
}

const DeleteNoteTargetContext = createContext<DeleteNoteTargetContextValue>();

interface DeleteNoteTargetProviderProps extends ParentProps {
  activeNoteId: string;
}

export function DeleteNoteTargetProvider(props: DeleteNoteTargetProviderProps) {
  const [selected, setSelected] = createSignal<SelectedNote>();
  const [isProcessing, setIsProcessing] = createSignal(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const latestSelected = createMemo<SelectedNote | undefined>(
    (prev) => selected() ?? prev,
  );

  const deleteMutation = useMutation(() => noteMutationDelete);

  return (
    <DeleteNoteTargetContext.Provider
      value={{
        setSelectedNote: (note) => setSelected(note),
      }}
    >
      {props.children}

      <DeleteNoteConfirmDialog
        isOpen={!!selected()?.id}
        title={latestSelected()?.title}
        onConfirm={async () => {
          const id = selected()?.id;
          if (!id) return;

          setIsProcessing(true);

          const isActiveNote = id === props.activeNoteId;
          const adjacentId = isActiveNote
            ? await queryClient.fetchQuery(noteQueryAdjacentNoteId(id)).catch(
              () => undefined,
            )
            : undefined;

          deleteMutation.mutate(id, {
            onSuccess: () => {
              if (!isActiveNote) return;

              if (adjacentId) {
                navigate({
                  to: "/notes/$id",
                  params: { id: adjacentId },
                  replace: true,
                });
              } else {
                navigate({ to: "/", replace: true });
              }
            },
            onSettled: () => {
              setSelected(undefined);
              setIsProcessing(false);
            },
          });
        }}
        onCancel={() => setSelected(undefined)}
        isPending={isProcessing() || deleteMutation.isPending}
      />
    </DeleteNoteTargetContext.Provider>
  );
}

export function useDeleteNoteTarget() {
  const ctx = useContext(DeleteNoteTargetContext);

  if (!ctx) {
    throw new Error(
      "DeleteNoteContext must be used within DeleteNoteContext.Provider",
    );
  }

  return ctx;
}

interface DeleteNoteTargetButtonProps
  extends Omit<ComponentProps<"button">, "onClick"> {
  note: SelectedNote;
}

export function DeleteNoteTargetButton(props: DeleteNoteTargetButtonProps) {
  const [_local, others] = splitProps(props, ["note", "class"]);

  const deleteNoteTarget = useDeleteNoteTarget();

  return (
    <Button
      {...others}
      onClick={() => deleteNoteTarget.setSelectedNote(props.note)}
      class={c(
        "hover:bg-transparent hover:text-red-500 focus-visible:text-red-500",
        props.class,
      )}
    >
      <Icon name="trash-2" />
    </Button>
  );
}
