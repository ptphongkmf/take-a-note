// routes/notes.index.tsx
import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/notes/")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
