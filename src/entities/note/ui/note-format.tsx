import { type EditorFormat, isEditorFormat } from "#shared/editor/schema.ts";
import type { IconName } from "#shared/ui/icon/icons.gen.ts";
import { Icon } from "#shared/ui/icon/icon.tsx";
import { ComponentProps, splitProps } from "solid-js";
import { titleCase } from "scule";
import { c } from "#shared/lib/class-merger/c.ts";

const NoteFormatIconMap = {
  "plain-text": "file-txt",
  "markdown": "file-md",
  "rich-text": "file-rt",
} satisfies Record<EditorFormat, IconName>;

interface NoteFormatIconProps {
  format: string;
  class?: string;
}

export function NoteFormatIcon(props: NoteFormatIconProps) {
  return (
    <Icon
      name={isEditorFormat(props.format)
        ? NoteFormatIconMap[props.format]
        : "file-x"}
      class={props.class}
    />
  );
}

interface NoteFormatLabelProps extends ComponentProps<"span"> {
  format: string;
  iconClass?: string;
}

export function NoteFormatLabel(props: NoteFormatLabelProps) {
  const [, others] = splitProps(props, ["class", "iconClass"]);

  return (
    <span
      {...others}
      class={c("inline-flex items-center gap-1 align-middle", props.class)}
    >
      <NoteFormatIcon
        format={props.format}
        class={c("size-[1.5em]", props.iconClass)}
      />
      <span>{titleCase(props.format)}</span>
    </span>
  );
}
