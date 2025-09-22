import { defineEventHandler, parseCookies, readBody } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);
    /*const sessionId = getCookie(event, 'session_id') || '';
    const { token } = getSession(sessionId);*/

    const {requestingUserId, token } = event.context;

    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {

        const {
            userId,
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.user.getSingleUser}/${userId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error) {
        // Handle errors from the external API
        console.error('Error posting leave:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error posting leaves',
        });
    }
});
