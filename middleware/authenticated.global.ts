//If the user does not have a token, we send it to login
//si el usuario no tiene token lo enviamos a login

import { useAuthStore } from '@/stores/authStore'


export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.layout == 'auth') return
  const auth = useAuthStore();
  console.log('auth')
  if (!auth.getToken) {
    return navigateTo("/login");
  }
})