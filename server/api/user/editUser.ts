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
            userName,
            userEmail,
            userDepartment,
            userRole,
            userPhone,
            userInternalPhone,
            userTitle,
            userTitleDescription
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.user.edit}`, {
            method: 'PUT',
            body: {
                "user_id": userId,
                "name": userName,
                "email": userEmail,
                "department_id": userDepartment,
                "role_id": userRole,
                "phone" : userPhone,
                "internal_phone": userInternalPhone,
                "job_title" : userTitle,
                "job_description" : userTitleDescription
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

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
