import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { requestingUserId, token } = event.context;

    if (!token) {
        throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
    }

    try {
        const { leaveId, status, reason } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.processLeave}`, {
            method: 'PUT',
            body: {
                leave_id: leaveId,
                user_editor: requestingUserId,
                status,
                reason
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        return response;
    } catch (error: any) {
        throw proxyError(error);
    }
});