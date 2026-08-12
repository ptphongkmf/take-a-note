/* @refresh reload */
import { render } from "solid-js/web";
import { RouterProvider } from "@tanstack/solid-router";
import { router } from "#app/router/router.ts";
import { invariant } from "#shared/lib/invariant/invariant.ts";
import "#app/styles/styles.global.css";

const root = document.getElementById("root");

invariant(root, "Root element not found");

render(() => <RouterProvider router={router} />, root);
