import { AppError } from "#shared/lib/errors/app-error.ts";
import { safeStringify } from "#shared/lib/string/safe-stringify.ts";
import {
  type ComponentProps,
  createSignal,
  For,
  Match,
  Show,
  splitProps,
  Switch,
} from "solid-js";
import { formatErrorDetails } from "#shared/lib/errors/format-error.ts";
import { c } from "#shared/lib/class-merger/c.ts";
import { MaterialSpinner } from "#shared/ui/spinner/material-spinner.tsx";
import { Icon } from "#shared/ui/icon/icon.tsx";
import { Button } from "#shared/ui/button/button.tsx";
import { delay } from "@std/async";

interface ErrorPanelProps extends ComponentProps<"div"> {
  e: unknown;
  retryFn: () => void | Promise<void>;
}

interface DisplayError {
  name: string;
  message: string;
  meta: [string, string | number | boolean][];
  causeTrace: string;
}

export function ErrorPanel(props: ErrorPanelProps) {
  const [local, others] = splitProps(props, ["class"]);
  const [copyStatus, setCopyStatus] = createSignal<"idle" | "success" | "error">("idle");
  const [retrying, setRetrying] = createSignal(false);

  const displayError = (): DisplayError =>
    props.e instanceof Error
      ? {
        name: props.e.name,
        message: props.e.message,
        meta: props.e instanceof AppError
          ? Object.entries(props.e.metadata ?? {})
          : [],
        causeTrace: formatErrorDetails(props.e),
      }
      : {
        name: "Unknown Error",
        message: safeStringify(props.e),
        meta: [],
        causeTrace: `Unknown Error: ${safeStringify(props.e)}`,
      };

  async function handleCopyDetails() {
    if (copyStatus() !== "idle") return;


    try {
      await navigator.clipboard.writeText(displayError().causeTrace);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }

    await delay(1500);
    setCopyStatus("idle");
  }

  async function handleRetry() {
    if (retrying()) return;

    setRetrying(true);
    try {
      await props.retryFn();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div
      role="alert"
      {...others}
      class={c(
        "@container flex flex-col items-start justify-start gap-4 p-4",
        local.class,
      )}
    >
      <header class="flex w-full flex-col items-start justify-start gap-1">
        <h3 class="text-fluid-lg font-semibold text-red-600">
          {displayError().name}
        </h3>
        <Show when={displayError().message}>
          {(msg) => <p class="text-fluid-base text-red-900/80">{msg()}</p>}
        </Show>
      </header>

      <Show when={displayError().meta.length > 0 && displayError().meta}>
        {(meta) => (
          <dl class="flex w-full flex-col gap-1.5 rounded-md">
            <For each={meta()}>
              {([key, value]) => (
                <div class="flex items-baseline justify-start gap-[1ch]">
                  <dt class="text-fluid-xs text-gray-600">
                    {key}:
                  </dt>
                  <dd class="text-fluid-sm font-medium text-gray-800">
                    {value}
                  </dd>
                </div>
              )}
            </For>
          </dl>
        )}
      </Show>

      <Show when={displayError().causeTrace}>
        {(trace) => (
          <details class="group w-full">
            <summary class="cursor-pointer items-center gap-1 text-fluid-sm font-medium text-gray-600 transition-colors select-none hover:text-gray-900">
              Details
            </summary>

            <pre class="mt-2 max-h-64 w-full overflow-y-auto rounded-md bg-gray-900 p-4 font-mono text-fluid-xs whitespace-pre-wrap text-gray-200 shadow-inner">
              {trace()}
            </pre>
          </details>
        )}
      </Show>

      <div class="flex w-full flex-wrap items-center justify-around gap-2 pt-2 text-fluid-sm font-medium">
        <Button
          onClick={handleCopyDetails}
          class={c(
            "flex items-center justify-center gap-2 flex-1 px-4 py-2 transition-colors",
            copyStatus() === "success" && "bg-green-300 text-emerald-800",
            copyStatus() === "error" && "bg-red-300 text-red-800 animate-shake",
            copyStatus() === "idle" && "hover:bg-white/20",
          )}
        >
          <Switch fallback="Copy details">
            <Match when={copyStatus() === "success"}>
              <Icon name="clipboard-check" />
              <span>Copied</span>
            </Match>
            <Match when={copyStatus() === "error"}>
              <Icon name="clipboard-x" />
              <span>Failed</span>
            </Match>
          </Switch>
        </Button>
        
        <Button
          onClick={handleRetry}
          disabled={retrying()}
          class="flex-1 items-center justify-center gap-2 flex bg-amber-100 px-4 py-2 hover:bg-amber-200/70"
        >
          <Show when={retrying()} fallback="Try Again">
            <MaterialSpinner />
          </Show>
        </Button>
      </div>
    </div>
  );
}
