import { createRouter } from "@tanstack/solid-router";
import { routeTree } from "#app/router/routeTree.gen.ts";
import { AppError } from "#shared/lib/errors/app-error.ts";

export const router = createRouter({ routeTree });

// export class RouterError extends AppError<"UNKNOWN_ROUTER_FAILURE"> {
//   public override readonly name = "RouterError";
// }

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}
