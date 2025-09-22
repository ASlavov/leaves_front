import {defineEventHandler, parseCookies, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { getSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);

    const {requestingUserId, token } = event.context;
    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {

        const {
            userIds,
            leaveTypeId,
            entitledDays,
            year,
            startDate,
            endDate
        } = body;
        console.log(body);
        const response = await $fetch(`${config.public.apiBase}${config.public.entitlement.massLeaves}`, {
            method: 'POST',
            body: {
                userIds: userIds,
                leave_type_id: leaveTypeId,
                entitled_days: entitledDays,
                year,
                startDate,
                endDate
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });
        console.log(response);

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
