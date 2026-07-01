import {
  type Accessor,
  createEffect,
  createSignal,
  on,
  onCleanup,
} from "solid-js";

interface SmoothSavingOptions {
  delayMs?: number;
  minDurationMs?: number;
}

export function createSmoothSavingState(
  orgSavingState: Accessor<boolean>,
  options: SmoothSavingOptions = {},
): Accessor<boolean> {
  // temporary setting min to 5000 to see if it really show up
  const { delayMs = 200, minDurationMs = 5000 } = options;

  const [showSaving, setShowSaving] = createSignal(false);

  let delayTimeout: number | undefined;
  let minDurationTimeout: number | undefined;
  let showStartTime = 0;

  createEffect(
    on(orgSavingState, (isSaving) => {
      if (isSaving) {
        // Cancel the hiding process if a new save starts immediately
        clearTimeout(minDurationTimeout);

        if (!showSaving()) {
          delayTimeout = globalThis.setTimeout(() => {
            setShowSaving(true);
            showStartTime = performance.now();
          }, delayMs);
        }
      } else {
        // Cancel the showing process if the save finished before the delay
        clearTimeout(delayTimeout);

        if (showSaving()) {
          const elapsed = performance.now() - showStartTime;
          const remaining = Math.max(0, minDurationMs - elapsed);

          minDurationTimeout = globalThis.setTimeout(() => {
            setShowSaving(false);
          }, remaining);
        }
      }
    }),
  );

  onCleanup(() => {
    clearTimeout(delayTimeout);
    clearTimeout(minDurationTimeout);
  });

  return showSaving;
}
