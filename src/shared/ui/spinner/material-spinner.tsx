import { type ComponentProps, splitProps } from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";

export interface MaterialSpinnerProps extends ComponentProps<"svg"> {
  /**
   * The thickness of the circle stroke.
   * Scales automatically with the SVG size.
   * @default 3.6
   */
  thickness?: number | string;
}

/**
 * Material design spinner component (Exact MUI Port).
 *
 * Renders an `<svg>` with a mathematically perfect stroke-dasharray animation.
 * All native `<svg>` props are forwarded.
 *
 * ### 🎨 Styled via CSS Classes
 * - **Size** — use `w-*` / `h-*` (or `size-*`) to control the radius.
 * - **Color** — use `text-<color>` to change the spinner color.
 *
 * ### ⚙️ Configured via Props
 * - **Thickness** — use the `thickness` prop to change the stroke width.
 *
 * @example
 * ```tsx
 * // Default thickness (3.6)
 * <MaterialSpinner class="size-10 text-blue-500" />
 * * // Custom thickness (e.g., thinner stroke for a larger spinner)
 * <MaterialSpinner class="size-20 text-gray-400" thickness={2} />
 * ```
 */
export function MaterialSpinner(props: MaterialSpinnerProps) {
  const [local, others] = splitProps(props, ["class", "thickness"]);

  return (
    <svg
      viewBox="22 22 44 44"
      {...others}
      class={c(
        "animate-mui-rotate size-[1em] text-current",
        local.class,
      )}
    >
      <circle
        class="animate-mui-dash"
        cx="44"
        cy="44"
        r="20.2"
        fill="none"
        stroke="currentColor"
        stroke-width={local.thickness || 3.6}
        stroke-linecap="round"
      />
    </svg>
  );
}
