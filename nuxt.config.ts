// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    // head
    head: {
      title: 'Indexa ERP',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'Indexa crm',
          name: 'Control de mantenimientos y soportes',
          content: 'Indexa ERP',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },
  plugins: ['~/plugins/ofetch.ts'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL,
    },
  },
  devtools: { enabled: true },
  modules: [
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-icon',
    'nuxt-permissions',
  ],
  piniaPersistedstate: {
    storage: 'localStorage',
    debbug: true,
  },
  elementPlus: {
    locale: 'es',
  },
  googleFonts: {
    families: {
      Roboto: true,
      'Josefin+Sans': true,
      Lato: [100, 300],
      Raleway: {
        wght: [100, 400],
        ital: [100]
      },
    }
  },
})
