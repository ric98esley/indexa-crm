import type { UseFetchOptions } from '#app';
import { defu } from 'defu';

import { useAuthStore } from '@/stores/authStore';

export function useApi<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {}
) {
  const authStore = useAuthStore();

  const userAuth = useCookie('token');
  const config = useRuntimeConfig();

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.apiUrl ?? 'https://api.nuxt.com',
    key: url,

    // set user token if connected
    headers: userAuth.value
      ? { Authorization: `Bearer ${userAuth.value}` }
      : {},

    onResponse(_ctx) {},

    onResponseError({ request, response, options }) {
      // Log error
      console.log(
        '[fetch response error]',
        request,
        response.status,
        response.body
      );
      const code = response.status;
      if (code === 401) {
        console.log('logout');
        authStore.reset();
      }
    },
  };

  const params = defu(options, defaults);

  return useFetch(url, params);
}
