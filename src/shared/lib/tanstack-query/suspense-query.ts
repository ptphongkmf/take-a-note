import {
  type CreateQueryOptions,
  type DefaultError,
  type DefinedCreateQueryResult,
  type QueryClient,
  type QueryKey,
  type UndefinedInitialDataOptions,
  useQuery,
} from "@tanstack/solid-query";

// TODO: remove this wrapper when tanstack query support return non-null data when working with suspense
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: CreateQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: () => QueryClient,
): DefinedCreateQueryResult<TData, TError> {
  return useQuery(
    (() => {
      const resolvedOptions = options();

      return {
        ...resolvedOptions,
        throwOnError: resolvedOptions.throwOnError ?? true,
      };
    }) as UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
    queryClient,
  ) as DefinedCreateQueryResult<TData, TError>;
}
