// utils/retryFetch.js
/*
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
}*/

export default async function retryFetch(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            // Use $fetch to get the response data
            const response = await $fetch(url, options);

            // Check if response contains statusCode 403 in the data
            if (response && response.statusCode === 403) {
                console.log('Received statusCode 403 in response data - handling error');

                // Perform necessary actions, e.g., logout or redirect
                useFetch('/api/auth/logout');

                retries = 0;
                // Since we've handled the error, exit the function or throw an error
                //throw new Error('403 Forbidden');
                return;
            }

            if (response && response.statusCode === 422) {
                console.log('Received statusCode 422 in response data - handling error');

                retries = 0;

                // Since we've handled the error, exit the function or throw an error
                //throw new Error('403 Forbidden');
                return;
            }

            if (response && response.statusCode === 500) {
                console.log('Received statusCode 500 in response data - handling error');

                retries = 0;

                // Since we've handled the error, exit the function or throw an error
                //throw new Error('403 Forbidden');
                return;
            }

            // Return the response data if no error
            return response;
        } catch (error) {
            // If the error is not related to statusCode 403, handle retries
            if (error.message === '403 Forbidden') {
                return error;
            }

            if (error.statusCode === 422) {
                console.log('Received statusCode 422 in response data - handling error');

                retries = 0;

                // Since we've handled the error, exit the function or throw an error
                //throw new Error('403 Forbidden');
                return error;
            }

            // If it's the last attempt, rethrow the error
            if (i === retries - 1) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
}