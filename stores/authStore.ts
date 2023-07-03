import { defineStore } from 'pinia';

interface User {
  name: string,
  lastaName: string,
  email: string,
}

export const useAuthStore = defineStore('auth', {
  state: (): { token: string | undefined, user: User | undefined } => ({
    token: undefined,
    user: undefined,
  }),
  persist: {
    storage: localStorage,
  },
  // optional getters
  getters: {
    // getters receive the state as first parameter
    getToken: (state): string | undefined => state.token,
    // use getters in other getters
    getUser: (state): User | undefined => state.user
  },
  // optional actions
  actions: {
    authState(token?: string, user?: User ) {
      this.token = token;
      this.user = user;
    },

    reset() {
      this.token = undefined;
      this.user = undefined;
      navigateTo("/login");
    },
  },
})