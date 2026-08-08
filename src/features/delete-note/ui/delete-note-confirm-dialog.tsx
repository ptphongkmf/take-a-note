import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "#shared/ui/alert-dialog/solidui-alert-dialog.tsx";
import { Button } from "#shared/ui/button/button.tsx";

interface DeleteNoteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function DeleteNoteConfirmDialog(props: DeleteNoteConfirmDialogProps) {
  return (
    <AlertDialog open={props.isOpen}>
      <AlertDialogContent showDefaultCloseButton={false}>
        <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>

        <AlertDialogDescription class="flex flex-col items-start justify-center gap-2">
          <p>Delete this note? This can't be undone.</p>
          <p class="text-fluid-base font-semibold text-gray-700">
            {props.title}
          </p>
        </AlertDialogDescription>

        <div role="group" class="flex items-center justify-end gap-4">
          <Button
            autofocus
            disabled={props.isPending}
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            disabled={props.isPending}
            onClick={props.onConfirm}
            class="bg-red-500 text-gray-100 hover:bg-red-600"
          >
            Confirm
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
