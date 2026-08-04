import type { SimplifyDeep } from "type-fest";
import { assertExists } from "@std/assert";

/**
 * A recursive type that removes `undefined` from types and converts
 * properties that could be undefined into optional properties.
 */
type CompactRecursive<T> = T extends Array<infer U> ? Array<CompactRecursive<U>>
  : T extends Record<string, unknown> ?
      & {
        // 1. Keep properties that can NEVER be undefined
        [K in keyof T as undefined extends T[K] ? never : K]: CompactRecursive<
          T[K]
        >;
      }
      & {
        // 2. Make properties optional if they CAN be undefined
        [K in keyof T as undefined extends T[K] ? K : never]?: CompactRecursive<
          Exclude<T[K], undefined>
        >;
      }
  : Exclude<T, undefined>;

type CompactKey<T> = SimplifyDeep<CompactRecursive<T>>;

// Constrain the input to only allow Objects or Arrays
type ValidKeyInput = Record<string, unknown> | unknown[];

/**
 * Deeply removes properties with `undefined` values to prevent TanStack Query's fuzzy matching
 * (`partialDeepEqual`) from failing when comparing explicit `undefined` properties against missing keys.
 *
 * Refs:
 * - https://github.com/TkDodo/blog-comments/discussions/71#discussioncomment-4348406
 * - https://github.com/TanStack/query/issues/3741
 *
 * @internal
 */
export function compactKey<const T extends ValidKeyInput>(
  input: T,
): CompactKey<T> {
  // Handle Arrays
  if (Array.isArray(input)) {
    const arrResult = [];
    for (let i = 0; i < input.length; i++) {
      const val = input[i];
      if (val !== undefined) {
        arrResult.push(
          Array.isArray(val) || isPlainObject(val)
            ? compactKey(val as ValidKeyInput)
            : val,
        );
      }
    }
    return arrResult as CompactKey<T>;
  }

  // Handle Objects
  const objResult = {} as Record<string, unknown>;
  const keys = Object.keys(input);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    assertExists(key, "Object.keys index out of bounds");

    const val = (input as Record<string, unknown>)[key];
    if (val !== undefined) {
      objResult[key] = Array.isArray(val) || isPlainObject(val)
        ? compactKey(val as ValidKeyInput)
        : val;
    }
  }

  return objResult as CompactKey<T>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
