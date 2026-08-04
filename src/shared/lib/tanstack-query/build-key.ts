import { compactKey } from "#shared/lib/tanstack-query/compact-key.ts";

export type QueryKeyObjShape = {
  entity: string;
  scope?: string;
  id?: string;
  filters?: Record<string, unknown>;
};

export function buildQueryKey<const T extends QueryKeyObjShape>(keyObj: T) {
  return [compactKey(keyObj)] as const;
}

export type MutationKeyObjShape = {
  entity: string;
  action: string;
  id?: string;
  variables?: Record<string, unknown>;
};

export function buildMutationKey<const T extends MutationKeyObjShape>(
  keyObj: T,
) {
  return [compactKey(keyObj)] as const;
}
