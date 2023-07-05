//If the user does not have a token, we send it to login
//si el usuario no tiene token lo enviamos a login

import { useAuthStore } from '@/stores/authStore'


export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  auth.readToken();
  if (to.meta.layout == 'auth') {
    if (auth.getToken) {
      return navigateTo("/");
    }
  }
  else{
    if (!auth.getToken) {
      return navigateTo("/login");
    }
  }
})