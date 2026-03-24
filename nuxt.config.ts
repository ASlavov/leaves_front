// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    // Preset is controlled by NITRO_PRESET env var on Netlify.
    // Do NOT hardcode 'netlify' here — it breaks local dev routing.
    ...(process.env.NITRO_PRESET ? { preset: process.env.NITRO_PRESET } : {}),
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  },
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  script: [
    {
      src: '/_nuxt/node_modules/preline/dist/preline.js',
      defer: true
    }
  ],
  css: [
    '~/assets/css/main.css',
    '@schedule-x/theme-default/dist/index.css'
  ],

  plugins: [
    "~/plugins/preline.client.ts",
    /*"~/plugins/fetchInterceptor.js",*/
    "~/plugins/vue3-toastify.client.js"
  ],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
  ],
  i18n: {
    lazy: true,
    restructureDir: '',
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'el',
        language: 'el-GR',
        file: 'el.json'
      }
    ]
  },
  imports: {
    dirs: ['stores'],  // If your stores are in the "stores" folder
  },

  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: process.env.apiSecret,
    // JWT Secret Key
    jwtSecret: process.env.jwtSecret,
    // Keys within public, will be also exposed to the client-side
    public: {
      // Uses local base when apiBaseLocal is defined in .env (local dev), falls back to prod
      apiBase: process.env.apiBaseLocal ?? process.env.apiBaseProd,
      apiBaseLocal: 'http://localhost:8000/api',
      apiBaseProd: 'https://leavesbackend.whyagency.gr/api',
      auth: {
        auth: '/getToken',
        tokenRefresh: '/generateToken',
        updatePassword: '/user-update-password'
      },
      user: {
        getSingleUser: '/user',
        getAll: '/users',
        edit: '/user-update',
        updatePassword: '/user-update-password'
      },
      entitlement: {
        add: '/entitlement',
        update: '/entitlement',
        delete: '/entitlement',
        get: '/entitlement_days',
        massRemote: '/import-workfromhome',
        massLeaves: '/import-mass-leaves',
      },
      leaves: {
        getAll: '/user_leaves',
        getAllForAllUsers: '/all_user_leaves',
        newLeave: '/new_leave',
        processLeave: '/processed_leave',
        getLeaveTypes: '/leaves_types',
        getLeavesStatuses: '/leave_action',
        getLeavesAvailableDays: '/entitlement_days',
      },
      departments: {
        getAll: '/departments',
        newDepartment: '/create_department',
        editDepartment: '/edit_department',
        deleteDepartment: '/delete_department',
      },
      notifications: {
        getNotifications: '/user-notifications',
        markedRead: '/notification-marked-read',
        markedUnread: '/notification-marked-unread',
      }
    }
  },
})