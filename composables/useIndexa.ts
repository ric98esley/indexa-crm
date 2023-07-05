export const useIndexa = (request: string, options: any) => {
    const {data, error, pending, refresh} = useLazyFetch(request, {
    ...options
  })
  return {data, error, pending, refresh}
}