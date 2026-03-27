import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { token } = event.context;

    if (!token) {
        throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
    }

    try {
        const { leaveTypeId } = body;
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.restoreLeaveType}/${leaveTypeId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response;
    } catch (error: any) {
        throw proxyError(error);
    }
});
