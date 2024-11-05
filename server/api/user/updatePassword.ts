import {defineEventHandler, parseCookies, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);
/*    const sessionId = getCookie(event, 'session_id') || '';
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
            oldPass,
            newPass,
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.user.updatePassword}`, {
            method: 'PUT',
            body: {
                "user_id": userId,
                "old_password": oldPass,
                "password": newPass,
                "requesting_user_id": requestingUserId,
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });
        if (response.exception) {
            throw createError({
                statusCode: response.statusCode || 400, // Use appropriate status code
                statusMessage: response.message || 'Error from external API',
                data: response, // Include additional response data if needed
            });
        }
        return response; // Return the response from the external API
    } catch (error) {
        // Handle errors from the external API
        console.error('Error editing user:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error editing user',
        });
    }
});
