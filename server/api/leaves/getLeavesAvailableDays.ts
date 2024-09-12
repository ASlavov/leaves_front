import {defineEventHandler, parseCookies, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event); // Get login details (email, password) from the request body
    const { userId } = body;
    // Retrieve the token from the 'auth_token' cookie set during login
    const sessionId = getCookie(event, 'session_id') || '';
    const { token } = getSession(sessionId);
    //console.log('userId:', userId);
    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {
        // Use the token to make a GET request to the external API
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.getLeavesAvailableDays}/${userId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
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
