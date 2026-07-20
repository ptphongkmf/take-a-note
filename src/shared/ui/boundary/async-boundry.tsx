import type { JSX, ParentProps } from "solid-js";
import { ErrorBoundary, Suspense } from "solid-js";
import SpinnerBlock from "#shared/ui/spinner/spinner-block.tsx";
import ErrorPanel from "#shared/ui/error/error-panel.tsx";

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
  errorFallback?: ((error: unknown, retryFn: () => void) => JSX.Element) | "error-panel";
}

/**
 * A wrapper component that combines `ErrorBoundary` and `Suspense`.
 * Provides default UI fallbacks ("material-spinner" and "error-panel") when not explicitly provided.
 */
export default function AsyncBoundary(props: AsyncBoundaryProps) {
  const suspense = () => {
    switch (props.suspenseFallback) {
      case undefined:
      case "material-spinner":
        return <SpinnerBlock />;
      
        default:
        return props.suspenseFallback;
    }
  };

  const error = () => {
    switch (props.errorFallback) {
      case undefined:
      case "error-panel":
        return (err: unknown, reset: () => void) => <ErrorPanel e={err} retryFn={reset} />;
      
        default:
        return props.errorFallback;
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
