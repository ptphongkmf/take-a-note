import { AppError } from "#shared/lib/errors/app-error.ts";
import { safeStringify } from "#shared/lib/string/safe-stringify.ts";

interface FormatErrorOptions {
  indent?: number;
  /** The characters printed at the very beginning, not affected by indent */
  prefix?: string;
}

export function formatError(e: Error, formatOpts?: FormatErrorOptions): string {
  const indent = " ".repeat(formatOpts?.indent ?? 0);
  const prefix = formatOpts?.prefix ?? indent;

  let err = `${prefix}${e.name}: ${e.message}\n`;

  if (e instanceof AppError) {
    for (const [key, value] of Object.entries(e.metadata ?? {})) {
      err += `${indent}  ${key}: ${value}\n`;
    }
  }

  return err;
}

export function formatErrorDetails(e: Error): string {
  // Hard-coded
  const PREFIX = "└── ";
  const INDENT = 4;

  let details = formatError(e);

  let currentCause: unknown = e.cause;
  while (currentCause) {
    if (currentCause instanceof Error) {
      details += formatError(currentCause, {
        indent: INDENT,
        prefix: PREFIX,
      });

      currentCause = currentCause.cause;
    } else {
      details += `${PREFIX}${safeStringify(currentCause, "Unknown Error")}\n`;

      break;
    }
  }

  return details;
}
