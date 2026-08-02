import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";
import Icon from "#shared/ui/icon/icon.tsx";
import Button from "#shared/ui/button/button.tsx";

export default function NoteAction(props: ComponentProps<"div">) {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      role="group"
      {...others}
      class={c("@container grid auto-rows-auto grid-cols-2 gap-4", local.class)}
    >
      <Button
        type="button"
        class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="file-plus" class="text-amber-800" />
        <span>New note</span>
      </Button>
      <Button
        type="button"
        class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="file-x" class="text-amber-800" />
        <span>Delete note</span>
      </Button>

      <Button
        type="button"
        class="flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="download" class="text-amber-800" />
        <span>Import</span>
      </Button>
      <Button
        type="button"
        class="flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="upload" class="text-amber-800" />
        <span>Export</span>
      </Button>

      <Button
        type="button"
        class="col-span-2 flex items-center justify-center gap-2 hover:bg-amber-100"
      >
        <Icon name="share-2" class="text-amber-800" />
        <span>Share</span>
      </Button>
    </div>
  );
}
