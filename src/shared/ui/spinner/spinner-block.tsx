import { type ComponentProps, splitProps } from "solid-js";
import MaterialSpinner from "#shared/ui/spinner/material-spinner.tsx";
import { c } from "#shared/lib/class-merger/c.ts";

export default function SpinnerBlock(props: ComponentProps<"div">) {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      {...others}
      class={c("flex size-full items-center justify-center", local.class)}
    >
      <MaterialSpinner />
    </div>
  );
}
