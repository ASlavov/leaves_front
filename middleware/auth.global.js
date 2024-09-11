export default defineNuxtRouteMiddleware(async (to, from) => {
    // Don't run the middleware if the user is already on the login page
    if (to.path === '/auth/login' || to.path === '/auth/forgot-password') {
        return;
    }

    // Call the local API to check session (make sure this endpoint works as expected)
    const { data } = await useFetch('/api/auth/checkSessionExists');

    // If the user is not authenticated, redirect to the login page
    if (!data.value?.authenticated) {
        return navigateTo('/auth/login');
    }
});
