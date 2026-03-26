import {defineEventHandler, parseCookies, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

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
            userId,
            leaveTypeId,
            entitledDays,
            year,
            startDate,
            endDate,
            rolloverPrevious,
            rolloverUntil,
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.entitlement.add}`, {
            method: 'POST',
            body: {
                user_id: userId,
                leave_type_id: leaveTypeId,
                entitled_days: entitledDays,
                year: year,
                start_from: startDate,
                end_to: endDate,
                rollover_previous: rolloverPrevious ?? false,
                rollover_until: rolloverUntil ?? null,
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });
        console.log(response);

        return response; // Return the response from the external API
    } catch (error:any) {
        // Handle errors from the external API
        console.error('Error posting leave:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error posting leaves',
        });
    }
});
