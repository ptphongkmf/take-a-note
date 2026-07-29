import * as v from "@valibot/valibot";

export function isUlid(input: unknown): boolean {
  if (typeof input !== "string") return false;

  const parsed = v.safeParse(v.pipe(v.string(), v.ulid()), input);

  return parsed.success;
}
