import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";
import { Icon } from "#shared/ui/icon/icon.tsx";
import { SnappyButton } from "#shared/ui/button/snappy-button.tsx";
import { NewNoteButton } from "#features/new-note/ui/new-note-button.tsx";
import { DeleteNoteButton } from "#features/delete-note/ui/delete-note-button.tsx";

interface NoteActionProps extends ComponentProps<"div"> {
  noteId: string;
}

export function NoteAction(props: NoteActionProps) {
  const [local, others] = splitProps(props, ["class", "noteId"]);

  return (
    <div
      role="group"
      {...others}
      class={c("@container grid auto-rows-auto grid-cols-2 gap-4", local.class)}
    >
      <NewNoteButton />
      <DeleteNoteButton noteId={props.noteId} />

      <SnappyButton
        type="button"
        class="flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="download" class="text-amber-800" />
        <span>Import</span>
      </SnappyButton>
      <SnappyButton
        type="button"
        class="flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="upload" class="text-amber-800" />
        <span>Export</span>
      </SnappyButton>

      <SnappyButton
        type="button"
        class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="share-2" class="text-amber-800" />
        <span>Share</span>
      </SnappyButton>
    </div>
  );
}
