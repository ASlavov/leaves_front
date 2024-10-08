import {defineEventHandler, parseCookies, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);
    const sessionId = getCookie(event, 'session_id') || '';
    const { token } = getSession(sessionId);

    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {

        const {
            userId,
            leaveTypeId,
            startDate,
            endDate,
            reason
        } = body;
        console.log(body);
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeave}`, {
            method: 'POST',
            body: {
                "id": userId,
                "leave_type_id": leaveTypeId,
                "start_date": startDate,
                "end_date": endDate,
                "reason": reason
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });
        console.log(response);
        /*if(response.error) {
            throw new Error(response.error);
        }*/
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
