/*
// @ts-ignore
import { useUserStore } from '@/stores/user';


// server/api/authUser.ts
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event); // This will get the request body (params)
    const userStore = useUserStore();
    // You can now access the private apiSecret here
    const response = await $fetch(config.public.leaves.apiBase + config.public.leaves.getAll, {
        method: 'GET',
        headers: {
            "Authorization": userStore.userData.token,
        },
    });

    return response;
});
*/

import { defineEventHandler, parseCookies } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    // Retrieve the token from the 'auth_token' cookie set during login
    const { auth_token } = parseCookies (event);

    if (!auth_token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {
        // Use the token to make a GET request to the external API
        const response = await $fetch(`${config.public.leaves.apiBase}${config.public.leaves.getAll}/5`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${auth_token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error) {
        // Handle errors from the external API
        console.error('Error fetching leaves:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching leaves',
        });
    }
});
