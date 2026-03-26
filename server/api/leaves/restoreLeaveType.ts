import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

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
        throw createError({ statusCode: 500, statusMessage: 'Error restoring leave type' });
    }
});
