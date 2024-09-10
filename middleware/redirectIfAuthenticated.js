// middleware/redirectIfAuthenticated.js

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Call the local API to check session authentication
    const { data, error } = await useFetch('/api/auth/authSession');

    // If there's an error or the user is not authenticated, let them access the login page
    if (error.value || !data.value?.authenticated) {
        return;
    }
    if (data.value?.authenticated) {
        return navigateTo('/home');
    }
});
