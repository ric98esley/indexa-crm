// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  spaLoadingTemplate: 'spa-loading.html',

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

  runtimeConfig: {
    public: {
      apiUrl: process.env.BASE_URL,
    },
  },

  devtools: { enabled: true },

  modules: [
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-icon',
    'nuxt-permissions',
  ],

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

  compatibilityDate: '2024-07-09',
})