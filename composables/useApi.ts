import type { UseFetchOptions } from '#app';

export function useApi<T>(
  url: string | (() => string),
  options?: any,
) {
  const { $api } = useNuxtApp();

  return useFetch<T>(url, {
    ...options,
    query: {},
    $fetch: $api
  });
}
