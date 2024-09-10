export default defineNuxtPlugin((nuxtApp) => {
    // Wrap the $fetch method to intercept responses
    nuxtApp.$fetch = async (url, options = {}) => {
        try {
            const response = await $fetch(url, options);
            return response;
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                // Redirect to login if unauthorized
                navigateTo('/auth/login');
            }
            throw error;
        }
    };
});