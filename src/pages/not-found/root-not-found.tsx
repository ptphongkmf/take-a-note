import type { NotFoundRouteProps } from "@tanstack/solid-router";

export default function RootNotFound(props: NotFoundRouteProps) {
  return <div>error not found: {String(props.data)}</div>;
}
