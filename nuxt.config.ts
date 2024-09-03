// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  css: [
      '~/assets/css/main.css'
  ],

  plugins: [
      "~/plugins/preline.client.ts"
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
      '@pinia/nuxt'
  ],


  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: '123',
    // Keys within public, will be also exposed to the client-side
    public: {
      users: {
        apiBase: '/users',
        auth: '/auth',
      }
    }
  },
})