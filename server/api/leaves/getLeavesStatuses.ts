import {defineEventHandler } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    
    const {requestingUserId, token } = event.context;
    
    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {
        // Use the token to make a GET request to the external API
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.getLeavesStatuses}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error:any) {
        // Handle errors from the external API
        console.error('Error fetching leaves:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching leaves',
        });
    }
});