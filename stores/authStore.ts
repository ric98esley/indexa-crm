import type { get } from 'http';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: (): { token?: string, user?: User, refreshToken?: string } => ({
    token: undefined,
    refreshToken: undefined,
    user: undefined,
  }),
  // optional getters
  getters: {
    // getters receive the state as first parameter
    getToken: (state): string | undefined => state.token,

    getRefreshToken: (state): string | undefined => state.refreshToken,
    // use getters in other getters
    getUser: (state): User | undefined => state.user,
  },
  // optional actions
  actions: {
    setAuthState({ refreshToken, token, user, ability }: { refreshToken?: string, ability: string[], token: string, user: User }) {
      this.token = token;
      this.user = user;

      const userRoles = useRoles();
      const userPermissions = usePermissions();

      userRoles.value = [user.role];
      userPermissions.value = ability || ['user:self'];

      //set auth object in localStorage - Grabamos el token en localStorage

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem('indexa-refresh', refreshToken);
      }
    },

    reset() {
      this.token = undefined;
      this.user = undefined;
      this.refreshToken = undefined;
      localStorage.removeItem('indexa-refresh');
      navigateTo("/login");
    },

    readToken() {
      const readToken = localStorage.getItem("indexa-refresh");
      //saving auth in state
      if (readToken)
        this.refreshToken = readToken;
    },
  },
})