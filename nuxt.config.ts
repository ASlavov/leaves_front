// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
      "~/plugins/fetchInterceptor.js",
      "~/plugins/apexcharts.client.ts",
      "~/plugins/vue3-toastify.client.js"
  ],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
  colorMode: {
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
  ],
  imports: {
    dirs: ['stores'],  // If your stores are in the "stores" folder
  },

  /*toast: {
    position: 'bottom-right',
    duration: 5000, // Duration the toast will be displayed in milliseconds
    keepOnHover: true, // Keeps the toast open if hovered over
    theme: 'bubble', // You can also use 'toasted-primary', 'toasted-secondary'
  },*/

  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: 'elRs9s4XoR6O7hveAhbeqqBzJhVhno5k6FStyQ0b',
    // Keys within public, will be also exposed to the client-side
    public: {
      apiBase: 'http://127.0.0.1:8000/api',
      auth: {
        auth: '/getToken',
        tokenRefresh: '/generateToken'
      },
      user: {
        getSingleUser: '/user',
        getAll: '/users',
        edit: '/user-update',
        updatePassword: '/user-update-password'
      },
      leaves: {
        getAll: '/user_leaves',
        getAllForAllUsers: '/all_user_leaves',
        newLeave: '/new_leave',
        cancelLeave: '/processed_leave',
        massAddEntitledDays: '/import-workfromhome',
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
        getNotifications: '/user-notifications'
      }
    }
  },
})