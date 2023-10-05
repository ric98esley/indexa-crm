import { defineStore } from 'pinia';

export const useAppStore = defineStore('auth', {
  state: (): { tabMenu: boolean, config: {} } => ({
    tabMenu: true,
    config: {},
  }),
  // optional actions
  actions: {
    setAuthState(config: {}) {
      this.config = {};

      const app = {
        config,
      }
      //set auth object in localStorage - Grabamos el token en localStorage
      localStorage.setItem('app', JSON.stringify(app));
    },

    readConfig() {
      let app = {
        config: {},
      };
      try {
        app = JSON.parse(localStorage.getItem("app")!);
      } catch (error) {
        console.log(error);
      }
      //saving auth in state
      if (!app) {
        this.config = {};
      }
      if (app) {
        this.config = app.config;
      }
    },
  },
})