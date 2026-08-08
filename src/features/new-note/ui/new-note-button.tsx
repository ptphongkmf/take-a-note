import { SnappyButtonLink } from "#shared/ui/link/snappy-button-link.tsx";
import { Icon } from "#shared/ui/icon/icon.tsx";

export function NewNoteButton() {
  return (
    <SnappyButtonLink
      to="/notes/new"
      class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
    >
      <Icon name="file-plus" class="text-amber-800" />
      <span>New note</span>
    </SnappyButtonLink>
  );
}
