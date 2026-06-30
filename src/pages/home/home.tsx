import NoteEditor from "#pages/home/ui/note-editor.tsx";
import NoteList from "#pages/home/ui/note-list.tsx";
import NoteAction from "#pages/home/ui/note-action.tsx";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "#shared/ui/sheet/solidui-sheet.tsx";
import type { NoteDto } from "#shared/api/services/note.ts";
import { Show } from "solid-js";
import Icon from "#shared/ui/icon/icon.tsx";

interface HomeProps {
  note: NoteDto;
}

export default function Home(props: HomeProps) {
  return (
    <div class="grid size-full grid-cols-1 grid-rows-[auto_1fr] gap-2 p-[clamp(0.5rem,2cqi,1rem)] @5xl:grid-cols-[minmax(15rem,1fr)_minmax(26rem,52rem)_minmax(15rem,1fr)] 
    @5xl:grid-rows-1 @5xl:gap-[clamp(0.5rem,2cqi,1rem)]">
      <nav class="flex w-full items-center justify-between bg-transparent @5xl:hidden">
        <Sheet>
          <SheetTrigger class="flex cursor-pointer items-center justify-center gap-1 rounded-md p-1 text-fluid-sm font-medium text-amber-800 
          transition-colors hover:bg-amber-100">
            <Icon name="list" />
            Note List
          </SheetTrigger>
          <SheetContent position="left">
            <NoteList />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger class="flex cursor-pointer items-center justify-center gap-1 rounded-md p-1 text-fluid-sm font-medium text-amber-800 
          transition-colors hover:bg-amber-100">
            Actions
            <Icon name="ellipsis-vertical" />
          </SheetTrigger>
          <SheetContent position="right">
            <NoteAction />
          </SheetContent>
        </Sheet>
      </nav>

      <aside class="@container hidden rounded-md p-4 @5xl:col-start-1 @5xl:block">
        <NoteList />
      </aside>

      {/* TODO: add fallback value which is safemode viewer for corrupt note */}
      <Show when={!props.note.isCorrupt && props.note}>
        {(note) => (
          <NoteEditor
            note={note()}
            class="@container @5xl:col-start-2"
          />
        )}
      </Show>

      <aside class="@container hidden rounded-md p-4 @5xl:col-start-3 @5xl:block">
        <NoteAction />
      </aside>
    </div>
  );
}
