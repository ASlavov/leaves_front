// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  css: [
      '~/assets/css/main.css'
  ],

  plugins: [
      "~/plugins/preline.client.ts",
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
  imports: {
    dirs: ['stores'],  // If your stores are in the "stores" folder
  },

  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: 'elRs9s4XoR6O7hveAhbeqqBzJhVhno5k6FStyQ0b',
    // Keys within public, will be also exposed to the client-side
    public: {
      apiBase: 'http://127.0.0.1:8000/api',
      auth: {
        auth: '/getToken',
        tokenRefresh: '/refreshToken'
      },
      user: {
        getSingleUser: '/user',
      },
      leaves: {
        getAll: '/user_leaves',
        newLeave: '/new_leave',
      }
    }
  },
})