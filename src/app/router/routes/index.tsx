import { createFileRoute } from "@tanstack/solid-router";
import Home from "#pages/home/home.tsx";

export const Route = createFileRoute("/")({
  component: Home,
});
