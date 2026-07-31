import {
  createForm,
  Field,
  Form,
  getInput,
  reset,
  submit,
  useField,
} from "@formisch/solid";
import {
  batch,
  type ComponentProps,
  createEffect,
  createSignal,
  Match,
  on,
  splitProps,
  Switch,
} from "solid-js";
import { c } from "#shared/lib/class-merger/c.ts";
import { Editor, EditorInput } from "#shared/editor/lexical-editor.tsx";
import * as v from "@valibot/valibot";
import type { EditorState } from "lexical";
import { Separator } from "@kobalte/core/separator";
import NoteFormatSwitcher from "#features/switch-note-format/ui/note-format-switcher.tsx";
import { EditorFormats } from "#shared/editor/schema.ts";
import { vTrimNonEmptyString } from "#shared/lib/schema/string.ts";
import SaveStatusIndicator from "#features/save-note/ui/save-status-indicator.tsx";
import { stringifyJson } from "#shared/lib/json/stringify.ts";
import { vTemporalInstant } from "#shared/lib/schema/datetime.ts";
import { Result } from "@praha/byethrow";
import { createNoteDirtyState } from "#entities/note/model/note-dirty-state.ts";
import type {
  NoteDtoCorrupt,
  NoteDtoValid,
} from "#shared/api/services/note.ts";
import createSaveNoteManager from "#features/save-note/model/save-note-manager.ts";
import { useQueryClient } from "@tanstack/solid-query";
import {
  noteQueryDetailOrDefault,
  noteQueryDetailOrDefaultKey,
} from "#entities/note/api/queries/note-detail-or-default-query.ts";
import { useSuspenseQuery } from "#shared/lib/tanstack-query/suspense-query.ts";

interface NoteEditorProps extends
  Omit<
    ComponentProps<"form">,
    "onSubmit" | "children" | "action" | "method" | "onReset"
  > {
  noteId: string;
}

export default function NoteEditor(props: NoteEditorProps) {
  const [_, others] = splitProps(props, ["noteId"]);

  const noteQuery = useSuspenseQuery(() =>
    noteQueryDetailOrDefault(props.noteId)
  );

  return (
    <Switch>
      <Match when={noteQuery.data.isCorrupt && noteQuery.data}>
        {(corruptNote) => (
          <ViewOnlyNoteEditor
            {...others}
            note={corruptNote()}
          />
        )}
      </Match>

      <Match when={!noteQuery.data.isCorrupt && noteQuery.data}>
        {(note) => <EditableNoteEditor {...others} note={note()} />}
      </Match>
    </Switch>
  );
}

interface EditableNoteEditorProps extends
  Omit<
    ComponentProps<"form">,
    "onSubmit" | "children" | "action" | "method" | "onReset"
  > {
  note: NoteDtoValid;
}

const NoteFormSchema = v.object({
  id: vTrimNonEmptyString,
  title: v.string(),
  format: v.enum(EditorFormats),
  isCorrupt: v.literal(false),
  createdAt: vTemporalInstant,
  updatedAt: v.pipe(
    vTemporalInstant,
    v.transform(() => Temporal.Now.instant()),
  ),
});
type NoteFormOutput = v.InferOutput<typeof NoteFormSchema>;

function EditableNoteEditor(props: EditableNoteEditorProps) {
  const [local, others] = splitProps(props, ["class", "note"]);

  const [lastChangedAt, setLastChangedAt] = createSignal(
    Temporal.Now.instant(),
  );

  const [latestSerializedNoteContent, setLatestSerializedNoteContent] =
    createSignal(Result.unwrap(stringifyJson(local.note.content)));
  const [noteContent, setNoteContent] = createSignal<EditorState>();

  const noteForm = createForm({
    schema: NoteFormSchema,
    initialInput: {
      id: local.note.id,
      title: local.note.title,
      format: local.note.format,
      isCorrupt: local.note.isCorrupt,
      createdAt: local.note.createdAt,
      updatedAt: local.note.updatedAt,
    },
  });

  const titleField = useField(noteForm, { path: ["title"] });
  const formatField = useField(noteForm, { path: ["format"] });

  const isDirty = createNoteDirtyState({
    title: () => getInput(noteForm, { path: ["title"] }),
    format: () => getInput(noteForm, { path: ["format"] }),
    isNoteMetaDirty: () => titleField.isDirty || formatField.isDirty,
    editorState: noteContent,
    latestSerializedState: latestSerializedNoteContent,
  });

  const saveManager = createSaveNoteManager({
    isDirty,
    lastChangedAt: lastChangedAt,
    triggerFormSubmit: () => submit(noteForm),
    onSaveSuccess: (savedNote: NoteDtoValid) => {
      batch(() => {
        reset(noteForm, {
          initialInput: { ...savedNote },
          keepInput: true,
          keepErrors: true,
          keepTouched: true,
          keepSubmitted: true,
        });

        setLatestSerializedNoteContent(
          Result.unwrap(stringifyJson(savedNote.content)),
        );
      });
    },
  });

  createEffect(on(
    () => [
      getInput(noteForm, { path: ["title"] }),
      getInput(noteForm, { path: ["format"] }),
      noteContent(),
    ],
    () => setLastChangedAt(Temporal.Now.instant()),
  ));

  function handleSaveNote(output: NoteFormOutput) {
    const note = { ...output, content: noteContent()?.toJSON() };
    saveManager.cancelAutosave();
    saveManager.executeSave(note);
  }

  return (
    <Form
      of={noteForm}
      onSubmit={handleSaveNote}
      {...others}
      class={c(
        "grid grid-rows-[auto_auto_1fr] gap-[clamp(0.25rem,2cqi,1.5rem)] rounded-md bg-paper-editor py-2",
        local.class,
      )}
    >
      <div class="flex flex-col items-center justify-start gap-[clamp(0.25rem,0.5cqi,1rem)] px-8">
        <Field of={noteForm} path={["title"]}>
          {(field) => (
            <input
              {...field.props}
              value={field.input}
              placeholder="Note title..."
              class={`w-full self-start rounded-none border-b-3 px-1 outline-none border-transparent bg-transparent py-1 text-base font-bold 
                transition-colors duration-200
                focus:border-amber-600`}
            />
          )}
        </Field>

        <div class="flex w-full items-center justify-between px-4">
          <Field of={noteForm} path={["format"]}>
            {(field) => (
              <NoteFormatSwitcher
                {...field.props}
                value={field.input}
                onInput={field.onInput}
              />
            )}
          </Field>

          <SaveStatusIndicator
            isDirty={isDirty()}
            isSaving={saveManager.isSaving()}
          />
        </div>
      </div>

      <Separator class="mx-auto w-[93%] bg-amber-800" />

      <div class="flex flex-col gap-1.5 text-fluid-sm">
        <Editor
          format={getInput(noteForm, { path: ["format"] }) ?? "plain-text"}
          initialValue={local.note.content}
          onInput={setNoteContent}
          class="size-full min-h-fit"
        >
          <EditorInput
            placeholder="Note content..."
            class="rounded-sm border-amber-600 px-12 py-1 text-base outline-none"
          />
        </Editor>
      </div>
    </Form>
  );
}

interface ViewOnlyNoteEditorProps extends
  Omit<
    ComponentProps<"form">,
    "onSubmit" | "children" | "action" | "method" | "onReset"
  > {
  note: NoteDtoCorrupt;
}

function ViewOnlyNoteEditor(props: ViewOnlyNoteEditorProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <form
      {...others}
      class={c("flex items-center justify-center p-4", local.class)}
    >
      <p>Note is corrupt, a safe view mode is WIP</p>
    </form>
  );
}
