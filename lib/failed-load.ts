interface QueryState {
  data: unknown;
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}

/**
 * The queries a page needs that failed with nothing to show. A failed
 * background refetch keeps its earlier data, so that is still shown.
 */
export function failedLoad(...queries: QueryState[]) {
  const failed = queries.filter((query) => query.isError && query.data === undefined);
  if (failed.length === 0) return null;
  return {
    error: failed[0].error,
    onRetry: () => failed.forEach((query) => query.refetch()),
    isRetrying: failed.some((query) => query.isFetching),
  };
}
