// app/router.options.ts
export default {
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
