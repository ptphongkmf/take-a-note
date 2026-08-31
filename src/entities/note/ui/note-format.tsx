import { type EditorFormat, isEditorFormat } from "#shared/editor/schema.ts";
import type { IconName } from "#shared/ui/icon/icons.gen.ts";
import { Icon } from "#shared/ui/icon/icon.tsx";

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
