export default async function (url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await $fetch(url, {
                ...options,
                onResponse({ response }) {
                    console.log('checking response', response?._data);
                    if (response?._data?.statusCode && response?._data?.statusCode === 403) {
                        console.log('Something went wrong - redirecting!!');
                        // Redirect to the login page
                        useFetch('/api/auth/logout');
                        //deleteCookie('session_id')
                    }
                    if (response?.status && response?.status === 403) {
                        console.log('Something went wrong - redirecting!!');
                        // Redirect to the login page
                        useFetch('/api/auth/logout');
                    }
                },
            });
            return response; // If successful, return the response
        } catch (error) {
            if (i === retries - 1) {
                throw error; // If it's the last attempt, throw the error
            }
            await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
            delay *= 2; // Exponential backoff
        }
    }
}

// Helper function to delete a cookie
function deleteCookie(name) {
    // Set the cookie with an expiry date in the past
    document.cookie = `${name}=; Max-Age=0; path=/;`
}