import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Disable scrolling for the 'settings' route or any specific route you want
    if (to.path.startsWith('/settings')) {
      return false;
    }

    // Default scroll behavior for other routes
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash };
    } else {
      return { top: 0 };
    }
  },
};
