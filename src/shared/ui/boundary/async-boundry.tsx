import type { JSX, ParentProps } from "solid-js";
import { ErrorBoundary, Suspense } from "solid-js";

interface AsyncBoundaryProps extends ParentProps {
  suspenseFallback?: JSX.Element;
  errorFallback?: (error: unknown, retryFn: () => void) => JSX.Element;
}

export default function AsyncBoundary(props: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={props.errorFallback}>
      <Suspense fallback={props.suspenseFallback}>
        {props.children}
      </Suspense>
    </ErrorBoundary>
  );
}
