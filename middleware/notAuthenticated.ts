//If the user has a token, we send it to index
//Si el usuario tiene token lo enviamos a index

import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore();

export default defineNuxtRouteMiddleware(() => {
  if (auth.getToken) {
    return navigateTo("/");
  }
})