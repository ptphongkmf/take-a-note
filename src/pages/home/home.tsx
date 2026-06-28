import NoteEditor from "#pages/home/ui/note-editor.tsx";
import type { NoteDto } from "#shared/api/services/note.ts";
import { Show } from "solid-js";

interface HomeProps {
  note: NoteDto;
}

export default function Home(props: HomeProps) {
  return (
    <div class="grid size-full grid-cols-1 gap-[clamp(0.5rem,2cqi,1rem)] p-[clamp(0.5rem,2cqi,1rem)] 
    @5xl:grid-cols-[minmax(15rem,1fr)_minmax(26rem,52rem)_minmax(15rem,1fr)]">
      <aside class="@container hidden rounded-md border border-amber-200 p-4 @5xl:col-start-1 @5xl:block">
        <p class="text-fluid-sm text-amber-800">Left Sidebar...</p>
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

      <aside class="@container hidden rounded-md border border-amber-200 p-4 @5xl:col-start-3 @5xl:block">
        <p class="text-fluid-sm text-amber-800">
          Right Sidebar...
        </p>

        <div class="flex flex-col justify-around gap-2">
          <button type="button">new note</button>
          <button type="button">import</button>
          <button type="button">export</button>
          <button type="button">share</button>
        </div>
      </aside>
    </div>
  );
}
