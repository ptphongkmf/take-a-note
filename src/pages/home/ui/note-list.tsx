import { noteQueryList } from "#entities/note/api/queries/note-list-query.ts";
import { useSuspenseQuery } from "#shared/lib/tanstack-query/suspense-query.ts";
import { type ComponentProps, For, splitProps } from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";
import { Link } from "@tanstack/solid-router";
import Icon from "#shared/ui/icon/icon.tsx";
import Button from "#shared/ui/button/button.tsx";

export default function NoteListAsync(props: ComponentProps<"ul">) {
  const [local, others] = splitProps(props, ["class"]);

  const noteListQuery = useSuspenseQuery(() => noteQueryList());

  return (
    <ul
      {...others}
      class={c(
        "@container flex w-full flex-col items-start justify-center gap-1",
        local.class,
      )}
    >
      <For
        each={noteListQuery.data}
        fallback={<p class="text-fluid-xs text-gray-600 italic">empty</p>}
      >
        {(note) => (
          <li class="group flex w-full items-center border-b-2 
          border-transparent text-fluid-xs transition-colors duration-75 hover:border-amber-800">
            <Link
              to="/notes/$id"
              params={{ id: note.id }}
              title={note.title}
              class="grid flex-1 grid-cols-[auto_minmax(0,1fr)_7rem] items-center gap-3 text-gray-900"
            >
              {/* TODO: add markdown, plain, rich icon */}
              <Icon name="bug" class="shrink-0 text-gray-600" />

              <span class="truncate text-left text-fluid-base">
                {note.title}
              </span>

              <span class="truncate text-right text-fluid-xs whitespace-nowrap text-gray-500">
                TODO: add relative time | long text testttttttttttt
              </span>
            </Link>

            <Button
              onClick={(e) => {
                e.preventDefault();
                alert("wip");
              }}
              aria-label="Delete note"
              class="w-fit p-2 pr-3 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent hover:text-red-500 focus-visible:opacity-100"
            >
              <Icon name="trash-2" class="size-4 shrink-0" />
            </Button>
          </li>
        )}
      </For>
    </ul>
  );
}
