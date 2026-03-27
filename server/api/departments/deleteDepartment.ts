import { defineEventHandler, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);

    const { requestingUserId, token } = event.context;
    // const sessionId = getCookie(event, 'session_id') || '';
    // const { token } = getSession(sessionId);

    /*if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }*/

    try {

        const {
            department_id,
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.departments.deleteDepartment}/${department_id}`, {
            method: 'DELETE',
            body: {
                "requesting_user_id": requestingUserId,
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error: any) {
        throw proxyError(error);
    }
});
