import { defineEventHandler, getCookie, deleteCookie, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { deleteSession } from '~/server/sessionStore';
import error from "nuxt/dist/core/runtime/nitro/error";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const { requestingUserId, token } = event.context;
    const body = await readBody(event);
    const { userId } = body;

    try {
        // Use the token to make a GET request to the external API
        const res = await fetch(
            `${config.public.apiBase}${config.public.notifications.getNotifications}/${userId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Check the response status
        if (res.status === 403) {
            const sessionId = getCookie(event, 'session_id') || '';
            deleteSession(sessionId);
            deleteCookie(event, 'session_id');
            return {
                statusCode: 403,
                statusMessage: 'Session invalid or expired',
            };
        }

        // Get the Content-Type header
        const contentType = res.headers.get('content-type') || '';

        // Check if the response is JSON
        if (!contentType.includes('application/json')) {
            return {
                statusCode: 403,
                statusMessage: 'Session invalid or expired',
            };
        }

        // Parse the JSON response
        const data = await res.json();

        if (data) {
            return data;
        } else {
            return {
                statusCode: 500,
                statusMessage: 'Something went wrong',
            };
        }
    } catch (error) {
        // Handle errors from the external API
        console.error('Error fetching notifications:', error);

        // If the error has a statusCode, use it; otherwise, default to 500
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Error fetching notifications',
        });
    }
});
