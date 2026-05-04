import { createSignal } from "solid-js";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@ryotarofr/lexical-solid/LexicalDraggableBlockPlugin";

interface DraggableBlockPluginProps {
  anchorRef: HTMLElement;
}

export function DraggableBlockPlugin(props: DraggableBlockPluginProps) {
  const [menuRef, setMenuRef] = createSignal<HTMLElement | null>(null);
  const [targetLineRef, setTargetLineRef] = createSignal<HTMLElement | null>(
    null,
  );

  const menuComponent = (
    <div
      ref={setMenuRef}
      class="absolute top-0 left-0 cursor-grab p-px transition-opacity duration-100 will-change-transform active:cursor-grabbing"
    >
      <button
        type="button"
        class="flex size-5 cursor-[inherit] items-center justify-center rounded-sm p-px text-base 
        text-stone-500 transition-colors duration-100 hover:bg-neutral-200"
      >
        ⠿
      </button>
    </div>
  );

  const targetLineComponent = (
    <div
      ref={setTargetLineRef}
      class="pointer-events-none absolute top-0 left-0 h-0.75 rounded-sm bg-blue-600 will-change-transform"
    />
  );

  function isOnMenu(element: HTMLElement) {
    return menuRef()?.contains(element) ?? false;
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={props.anchorRef}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={menuComponent}
      targetLineComponent={targetLineComponent}
      isOnMenu={isOnMenu}
    />
  );
}
