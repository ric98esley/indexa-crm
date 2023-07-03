import { UseFetchOptions } from "nuxt/app"
import { KeysOf } from "nuxt/dist/app/composables/asyncData"

export const useIndexa = (request: string, options: UseFetchOptions = {}) => {
  const config = useRuntimeConfig()
  return useLazyFetch(request, {
    baseURL: config.public.BASE_URL,
    ...options
  })
}