import type { NotFoundRouteProps } from "@tanstack/solid-router";

export function RootNotFound(props: NotFoundRouteProps) {
  return <div>error not found: {String(props.data)}</div>;
}
