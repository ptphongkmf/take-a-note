import { DeleteNoteConfirmDialog } from "#features/delete-note/ui/delete-note-confirm-dialog.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { noteMutationDelete } from "#features/delete-note/api/delete-note-mutation.ts";
import { createMemo, createSignal } from "solid-js";
import { SnappyButton } from "#shared/ui/button/snappy-button.tsx";
import { Icon } from "#shared/ui/icon/icon.tsx";
import { noteQueryDetailOrDefault } from "#entities/note/api/queries/note-detail-or-default-query.ts";
import { useNavigate } from "@tanstack/solid-router";
import {
  noteQueryAdjacentNoteId,
} from "#entities/note/api/queries/note-adjacent-note-id-query.ts";

interface DeleteNoteButtonProps {
  noteId: string;
}

export function DeleteNoteButton(props: DeleteNoteButtonProps) {
  const [open, setOpen] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const noteQuery = useQuery(() => noteQueryDetailOrDefault(props.noteId));
  const deleteMutation = useMutation(() => noteMutationDelete);

  const noteTitle = createMemo(() =>
    typeof noteQuery.data?.title === "string" ? noteQuery.data.title : undefined
  );

  return (
    <>
      <SnappyButton
        disabled={deleteMutation.isPending}
        onClick={() => setOpen(true)}
        class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="trash-2" class="text-amber-800" />
        <span>Delete note</span>
      </SnappyButton>

      <DeleteNoteConfirmDialog
        isOpen={open()}
        title={noteTitle()}
        onConfirm={async () => {
          setIsProcessing(true);

          const adjacentId = await queryClient.fetchQuery(
            noteQueryAdjacentNoteId(props.noteId),
          ).catch(() => undefined);

          deleteMutation.mutate(
            props.noteId,
            {
              onSuccess: () =>
                adjacentId
                  ? navigate({
                    to: "/notes/$id",
                    params: { id: adjacentId },
                    replace: true,
                  })
                  : navigate({ to: "/", replace: true }),
              onSettled: () => {
                setOpen(false);
                setIsProcessing(false);
              },
            },
          );
        }}
        onCancel={() => setOpen(false)}
        isPending={isProcessing() || deleteMutation.isPending}
      />
    </>
  );
}
