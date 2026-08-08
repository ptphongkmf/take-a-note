import { useMutation } from "@tanstack/solid-query";
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

interface DeleteNoteTargetContextValue {
  setSelectedNote: (note: SelectedNote) => void;
}

const DeleteNoteTargetContext = createContext<DeleteNoteTargetContextValue>();

interface SelectedNote {
  id: string;
  title: string;
}

export function DeleteNoteTargetProvider(props: ParentProps) {
  const [selected, setSelected] = createSignal<SelectedNote>();

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
        title={latestSelected()?.title ?? ""}
        onConfirm={() => {
          const id = selected()?.id;

          if (id) {
            deleteMutation.mutate(id, {
              onSettled: () => {
                setSelected(undefined);
              },
            });
          }
        }}
        onCancel={() => setSelected(undefined)}
        isPending={deleteMutation.isPending}
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
  const [_local, others] = splitProps(props, ["note"]);

  const deleteNoteTarget = useDeleteNoteTarget();

  return (
    <Button
      {...others}
      onClick={() => deleteNoteTarget.setSelectedNote(props.note)}
    >
      <Icon name="trash-2" />
    </Button>
  );
}
