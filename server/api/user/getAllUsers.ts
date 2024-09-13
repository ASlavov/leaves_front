import { defineEventHandler, readBody } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const sessionId = getCookie(event, 'session_id') || '';
    const { token } = getSession(sessionId);

    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {

        const response = await $fetch(`${config.public.apiBase}${config.public.user.getAll}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error) {
        // Handle errors from the external API
        console.error('Error getting all users:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error getting all users',
        });
    }
});
