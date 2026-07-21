import { Result } from "@praha/byethrow";
import {
  AppError,
  type AppErrorOptions,
} from "#shared/lib/errors/app-error.ts";

export class TemporalParseError extends AppError<"TEMPORAL_PARSE_FAILED"> {
  public override readonly name = "TemporalParseError";

  constructor(
    message = "Failed to parse Temporal value",
    opts?: Omit<AppErrorOptions<"TEMPORAL_PARSE_FAILED">, "code">,
  ) {
    super(message, { ...opts, code: "TEMPORAL_PARSE_FAILED" });
  }
}

export function parseTemporal<T>(
  parseFn: () => T,
): Result.Result<T, TemporalParseError> {
  return Result.try({
    try: parseFn,
    catch: (e) => new TemporalParseError(undefined, { cause: e }),
  });
}
