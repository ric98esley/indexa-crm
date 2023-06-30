// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    // head
    head: {
      title: 'Indexa CRM',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'Indexa crm',
          name: 'Control de mantenimientos y soportes',
          content: 'Indexa CRM',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },
  devtools: { enabled: true },
  modules: ['@element-plus/nuxt', '@nuxtjs/tailwindcss'],
  elementPlus: {
    locale: 'es',
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    exposeLevel: 2,
    config: {},
    injectPosition: 'first',
    viewer: true,
  }
})
