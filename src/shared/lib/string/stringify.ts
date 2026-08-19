export function stringifyOrFallback(
  v: unknown,
  fallback: string = "[Unstringifiable Value]",
): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";

  if (typeof v === "string") return v;

  try {
    return JSON.stringify(v);
  } catch {
    try {
      return String(v);
    } catch {
      return fallback;
    }
  }
}
