import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: (): { token?: string | null, user?: User | null } => ({
    token: null,
    user: null,
  }),
  // optional getters
  getters: {
    // getters receive the state as first parameter
    getToken: (state): string => state.token!,
    // use getters in other getters
    getUser: (state): User => state.user!,
  },
  // optional actions
  actions: {
    setAuthState(token?: string, user?: User) {
      this.token = token;
      this.user = user;

      const auth = {
        token,
        user,
      }
      //set auth object in localStorage - Grabamos el token en localStorage
      localStorage.setItem('auth', JSON.stringify(auth));
    },

    reset() {
      this.token = undefined;
      this.user = undefined;
      localStorage.removeItem('auth');
      navigateTo("/login");
    },

    readToken() {
      let auth = {
        token: undefined,
        user: undefined,
      };
      try {
        auth = JSON.parse(localStorage.getItem("auth")!);
      } catch (error) {
        console.log(error);
      }
      //saving auth in state
      if (!auth) {
        this.token = undefined;
        this.user = undefined;
      }
      if (auth) {
        this.token = auth.token;
        this.user = auth.user;
      }
    },
  },
})