import type { ErrorComponentProps } from "@tanstack/solid-router";

export default function RootCriticalError(props: ErrorComponentProps) {
  return <div>root critical error: {String(props.error)}</div>;
}
