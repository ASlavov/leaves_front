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
    apiSecret: 'elRs9s4XoR6O7hveAhbeqqBzJhVhno5k6FStyQ0b',
    // Keys within public, will be also exposed to the client-side
    public: {
      users: {
        apiBase: 'http://127.0.0.1:8000/api',
        auth: '/getToken',
      },
      leaves: {
        apiBase: 'http://127.0.0.1:8000/api',
        getAll: '/user_leaves'
      }
    }
  },
})