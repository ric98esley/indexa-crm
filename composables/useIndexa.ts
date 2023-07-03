import { UseFetchOptions } from "nuxt/app"

export const useIndexa = (request: string, options: any) => {
  const config = useRuntimeConfig()
    const {data, error, pending, refresh} = useLazyFetch(request, {
    ...options
  })
  return {data, error, pending, refresh}
}