import type { NoteDtoValid } from "#shared/api/services/note.ts";
import { monotonicUlid } from "@std/ulid/monotonic-ulid";
import { decodeTime } from "@std/ulid/decode-time";
import { Result } from "@praha/byethrow";
import { parseTemporal } from "#shared/lib/datetime/parse.ts";

export function createEmptyNote(id = monotonicUlid()): NoteDtoValid {
  const ms = decodeTime(id);

  return {
    id: id ?? monotonicUlid(),
    title: "",
    format: "plain-text",
    isCorrupt: false,
    createdAt: Result.unwrap(
      parseTemporal(() => Temporal.Instant.fromEpochMilliseconds(ms)),
    ),
    updatedAt: Result.unwrap(
      parseTemporal(() => Temporal.Instant.fromEpochMilliseconds(ms)),
    ),
  };
}
