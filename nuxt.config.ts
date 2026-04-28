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
        'Access-Control-Allow-Origin': '*',
      },
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  css: ['~/assets/css/main.css', '@schedule-x/theme-default/dist/index.css'],

  plugins: [
    /*"~/plugins/fetchInterceptor.js",*/
    '~/plugins/vue3-toastify.client.js',
    '~/plugins/echo.client.ts',
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
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
    '@nuxt/eslint',
  ],
  i18n: {
    lazy: true,
    restructureDir: '',
    langDir: 'locales',
    defaultLocale: 'el',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json',
      },
      {
        code: 'el',
        language: 'el-GR',
        file: 'el.json',
      },
    ],
  },
  imports: {
    dirs: ['stores'], // If your stores are in the "stores" folder
  },

  vite: {
    server: {
      watch: {
        usePolling: false,
        // Prevent Playwright output files from triggering HMR during dev
        ignored: ['**/playwright-report/**', '**/test-results/**', '**/e2e/.auth/**'],
      },
    },
  },

  runtimeConfig: {
    // The private keys which are only available within server-side
    // These can be overridden by NUXT_API_SECRET and NUXT_JWT_SECRET
    apiSecret: process.env.NUXT_API_SECRET || process.env.apiSecret || '',
    jwtSecret: process.env.NUXT_JWT_SECRET || process.env.jwtSecret || 'fallback-secret-change-me',
    env: process.env.NUXT_ENV || process.env.env || 'production',

    public: {
      // Uses local base when apiBaseLocal is defined in .env (local dev), falls back to prod
      apiBase: process.env.apiBaseLocal ?? process.env.apiBaseProd,
      apiBaseLocal: 'http://localhost:8000/api',
      apiBaseProd: 'https://leavesbackend.whyagency.gr/api',
      reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || '',
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || 'localhost',
      reverbPort: parseInt(process.env.NUXT_PUBLIC_REVERB_PORT || '8081'),
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http',
      auth: {
        auth: '/getToken',
        tokenRefresh: '/generateToken',
        updatePassword: '/user-update-password',
      },
      user: {
        getSingleUser: '/user',
        getAll: '/users',
        add: '/users',
        delete: '/user',
        edit: '/user-update',
        updatePassword: '/user-update-password',
        dashboardPreferences: '/dashboard-preferences',
      },
      entitlement: {
        add: '/entitlement',
        update: '/entitlement',
        delete: '/entitlement',
        get: '/entitlement_days',
        massRemote: '/import-workfromhome',
        massLeaves: '/import-mass-leaves',
        massDelete: '/mass-delete-entitlements',
      },
      leaves: {
        getAll: '/user_leaves',
        getAllForAllUsers: '/all_user_leaves',
        newLeave: '/new_leave',
        processLeave: '/processed_leave',
        cancelLeave: '/processed_leave',
        getLeaveTypes: '/leaves_types',
        getLeavesStatuses: '/leave_action',
        getLeavesAvailableDays: '/entitlement_days',
        newLeaveType: '/new_leave_type',
        updateLeaveType: '/update_leave_type',
        deleteLeaveType: '/delete_leave_type',
        restoreLeaveType: '/restore_leave_type',
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
        markAllRead: '/notifications-mark-all-read',
      },
      holidays: {
        getAll: '/public-holidays',
        create: '/public-holidays',
        update: '/public-holidays',
        delete: '/public-holidays',
        batch: '/public-holidays/batch',
      },
      companySettings: {
        workWeek: '/company-settings/work-week',
      },
      invitations: {
        list: '/invitations',
        create: '/new-invitation',
        updateStatus: '/invitations',
        delete: '/invitations',
      },
      reports: {
        leaveBalances: '/reports/leave-balances',
        summary: '/reports/summary',
      },
      admin: {
        leave: '/admin/leaves',
        terminate: '/users',
      },
      permissions: {
        base: '/v1/permissions',
        me: '/v1/permissions/me',
      },
      documents: {
        base: '/company-documents',
      },
      orgChart: {
        base: '/org-chart',
      },
    },
  },
});
