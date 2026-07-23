import NoteEditor from "#pages/home/ui/note-editor.tsx";
import NoteListAsync from "#pages/home/ui/note-list.tsx";
import NoteAction from "#pages/home/ui/note-action.tsx";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "#shared/ui/sheet/solidui-sheet.tsx";
import { Show } from "solid-js";
import Icon from "#shared/ui/icon/icon.tsx";
import { noteQueryDetail } from "#entities/note/api/queries/note-detail-query.ts";
import { useSuspenseQuery } from "#shared/lib/tanstack-query/suspense-query.ts";
import { getRouteApi } from "@tanstack/solid-router";
import AsyncBoundary from "#shared/ui/boundary/async-boundry.tsx";

const HOME_ROUTE = getRouteApi("/notes/$id");

export default function Home() {
  const params = HOME_ROUTE.useParams();

  const noteQuery = useSuspenseQuery(() => noteQueryDetail.detail(params().id));

  return (
    <div class="grid size-full grid-cols-1 grid-rows-[auto_1fr] gap-2 p-[clamp(0.5rem,2cqi,1rem)] @5xl:grid-cols-[minmax(15rem,1fr)_minmax(26rem,52rem)_minmax(15rem,1fr)] 
    @5xl:grid-rows-1 @5xl:gap-[clamp(0.5rem,2cqi,1rem)]">
      {
        /* <nav class="flex w-full items-center justify-between bg-transparent @5xl:hidden">
        <Sheet>
          <SheetTrigger class="flex cursor-pointer items-center justify-center gap-1 rounded-md p-1 text-fluid-sm font-medium text-amber-800
          transition-colors hover:bg-amber-100">
            <Icon name="list" />
            Note List
          </SheetTrigger>
          <SheetContent position="left" class="bg-paper-aged">
            <SheetTitle class="flex items-center justify-start gap-1 rounded-md p-1 text-fluid-lg font-medium text-amber-800">
              <Icon name="list" />
              Notes
            </SheetTitle>

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
      </nav> */
      }

      <aside class="@container hidden flex-col items-start justify-start gap-4 rounded-md p-4
      @5xl:col-start-1 @5xl:flex">
        <h2 class="flex items-center justify-center gap-1 rounded-md p-1 text-fluid-lg font-medium text-amber-800">
          <Icon name="list" />
          Notes
        </h2>

        <nav class="w-full text-fluid-sm">
          <AsyncBoundary>
            <NoteListAsync />
          </AsyncBoundary>
        </nav>
      </aside>

      <main class="@container @5xl:col-start-2">
        <AsyncBoundary>
          {/* TODO: add fallback component which is safemode viewer for corrupt note */}
          <Show
            when={!noteQuery.data.isCorrupt && noteQuery.data}
            fallback={<p>Note is corrupt, a safe view mode is WIP</p>}
          >
            {(note) => <NoteEditor note={note()} class="size-full" />}
          </Show>
        </AsyncBoundary>
      </main>

      <aside class="@container hidden rounded-md p-4 @5xl:col-start-3 @5xl:flex">
        <NoteAction />
      </aside>
    </div>
  );
}
