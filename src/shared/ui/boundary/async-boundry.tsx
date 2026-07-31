import type { JSX, ParentProps } from "solid-js";
import { ErrorBoundary, Suspense } from "solid-js";
import SpinnerBlock from "#shared/ui/spinner/spinner-block.tsx";
import ErrorPanel from "#shared/ui/error/error-panel.tsx";
import { useQueryClient } from "@tanstack/solid-query";

/**
 * Props for the AsyncBoundary component.
 */
interface AsyncBoundaryProps extends ParentProps {
  /**
   * The fallback to render while the component is suspended.
   * Defaults to `"material-spinner"` which renders a `<SpinnerBlock />`.
   */
  suspenseFallback?: JSX.Element | "material-spinner";

  /**
   * The fallback to render when an error is caught.
   * Defaults to `"error-panel"` which renders an `<ErrorPanel />`.
   */
  errorFallback?:
    | ((error: unknown, reset: () => void) => JSX.Element)
    | "error-panel";

  /**
   * When true, also calls `queryClient.invalidateQueries()` before the
   * boundary resets. Opt-in — not every boundary wraps a query.
   * Defaults to false.
   */
  invalidateQueriesOnReset?: boolean;
}

/**
 * A wrapper component that combines `ErrorBoundary` and `Suspense`.
 * Provides default UI fallbacks ("material-spinner" and "error-panel") when not explicitly provided.
 */
export default function AsyncBoundary(props: AsyncBoundaryProps) {
  const queryClient = useQueryClient();

  const suspense = (): AsyncBoundaryProps["suspenseFallback"] => {
    switch (props.suspenseFallback) {
      case "material-spinner":
        return <SpinnerBlock />;

      case undefined:
        return <SpinnerBlock />;

      default:
        return props.suspenseFallback;
    }
  };

  function retry(reset: () => void) {
    return () => {
      if (props.invalidateQueriesOnReset) {
        void queryClient.invalidateQueries();
      }
      reset();
    };
  }

  const error = (): AsyncBoundaryProps["errorFallback"] => {
    switch (props.errorFallback) {
      case "error-panel":
        return (err, reset) => <ErrorPanel e={err} retryFn={retry(reset)} />;

      case undefined:
        return (err, reset) => <ErrorPanel e={err} retryFn={retry(reset)} />;

      default: {
        const custom = props.errorFallback;
        return (err, reset) => custom(err, retry(reset));
      }
    }
  };

  return (
    <ErrorBoundary fallback={error()}>
      <Suspense fallback={suspense()}>
        {props.children}
      </Suspense>
    </ErrorBoundary>
  );
}
