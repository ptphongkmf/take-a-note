import { type ComponentProps, splitProps } from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";
import { createLink } from "@tanstack/solid-router";

function BaseSnappyButtonLink(props: ComponentProps<"a">) {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <a
      {...others}
      class={c(
        "size-fit w-full cursor-pointer rounded-md px-3 py-1.5",
        "transition-colors duration-0 hover:bg-neutral-200/60 hover:duration-75 hover:ease-out",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        local.class,
      )}
    >
      {local.children}
    </a>
  );
}

export const SnappyButtonLink = createLink(BaseSnappyButtonLink);
