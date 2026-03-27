import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

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
        return response;
    } catch (error: any) {
        throw proxyError(error);
    }
});
