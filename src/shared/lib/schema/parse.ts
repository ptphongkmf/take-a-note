import * as v from "@valibot/valibot";
import { Result } from "@praha/byethrow";
import {
  AppError,
  type AppErrorOptions,
} from "#shared/lib/errors/app-error.ts";

class ValidationError extends AppError<"VALIDATION_FAILED"> {
  public override readonly name = "ValidationError";

  constructor(
    message = "Failed to parse and validate input against schema",
    opts?: Omit<AppErrorOptions<"VALIDATION_FAILED">, "code">,
  ) {
    super(message, { ...opts, code: "VALIDATION_FAILED" });
  }
}

// sync schema
export function parseSchema<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
): Result.Result<v.InferOutput<TSchema>, ValidationError>;

// async schema
export function parseSchema<
  TSchema extends v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
): Result.ResultAsync<v.InferOutput<TSchema>, ValidationError>;

export function parseSchema(
  schema:
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
  input: unknown,
):
  | Result.Result<unknown, ValidationError>
  | Result.ResultAsync<unknown, ValidationError> {
  return Result.try({
    try: () =>
      schema.async ? v.parseAsync(schema, input) : v.parse(schema, input),
    catch: (e) =>
      new ValidationError(
        v.isValiError(e) ? "TODO: create a prettyfy error fn" : undefined,
        { cause: e },
      ),
  });
}
