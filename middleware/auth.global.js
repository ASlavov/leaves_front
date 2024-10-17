export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicPaths = ['/auth/login', '/auth/forgot-password'];
    const isPublicPath = publicPaths.includes(to.path);

    const { data } = await useFetch('/api/auth/checkSessionExists');

    const isAuthenticated = data.value?.authenticated;

    if (isAuthenticated && isPublicPath) {
        return navigateTo('/home');
    }

    if (!isAuthenticated && !isPublicPath) {
        return navigateTo('/auth/login');
    }
});

// middleware/auth.js

/*
export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicPaths = ['/auth/login', '/auth/forgot-password'];
    const isPublicPath = publicPaths.includes(to.path);

    // Call the local API to check session authentication
    const { data, error } = await useFetch('/api/auth/checkSessionExists', {
        // Ensure cookies are sent with the request
        credentials: 'include',
        headers: useRequestHeaders(['cookie']),
    });

    const isAuthenticated = data.value?.authenticated;

    if (isAuthenticated) {
        // If the user is authenticated and is trying to access a public page, redirect to home
        if (isPublicPath) {
            return navigateTo('/home');
        }
        // Allow access to the route
        return;
    } else {
        // If the user is not authenticated and is trying to access a protected page, redirect to login
        if (!isPublicPath) {
            return navigateTo('/auth/login');
        }
        // Allow access to the public route
        return;
    }
});
*/


/*
// middleware/redirectIfAuthenticated.js

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (to.path !== '/auth/login' || to.path !== '/auth/forgot-password') {
        return;
    }
    // Call the local API to check session authentication
    const { data, error } = await useFetch('/api/auth/checkSessionExists');

    // If there's an error or the user is not authenticated, let them access the login page
    if (error.value || !data.value?.authenticated) {
        return;
    }
    if (data.value?.authenticated) {
        return navigateTo('/home');
    }
});
*/

// middleware/auth.ts
/*
export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicPaths = ['/auth/login', '/auth/forgot-password'];
    const isPublicPath = publicPaths.includes(to.path);

    const { data } = await $fetch('/api/auth/checkSessionExists', {
        credentials: 'include',
        headers: useRequestHeaders(['cookie']),
    });

    const isAuthenticated = data.value?.authenticated;

    if (isAuthenticated && isPublicPath) {
        return navigateTo('/home');
    }

    if (!isAuthenticated && !isPublicPath) {
        return navigateTo('/auth/login');
    }
});
*/
