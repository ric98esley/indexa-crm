import { UseFetchOptions } from "nuxt/app"
import { KeysOf } from "nuxt/dist/app/composables/asyncData"

export const useIndexa = async (request: string, options?: UseFetchOptions<unknown, unknown, KeysOf<unknown>, null, string, "get"> | undefined) => {
  const config = useRuntimeConfig()
  return await useLazyFetch(request, {
    baseURL: config.public.BASE_URL,
    ...options
  })
}