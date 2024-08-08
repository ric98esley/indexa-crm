import { useAuthStore } from '@/stores/authStore';


export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiUrl,
    onRequest ({ request, options }) {
      if (authStore.getToken) {
        options.headers = { Authorization: `Bearer ${authStore.getToken}` }
      }
    },
    onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, error)
    },
    onResponseError({ request, response, options }) {
      // Log error
      console.log('[fetch response error]', request, response.status, response.body)
      const code = response.status;
      if (code === 401) {
        authStore.reset()
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})