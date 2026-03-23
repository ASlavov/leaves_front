import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { token } = event.context;

    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {
        const { id, name } = body;

        // Map frontend payload to backend expectations
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.updateLeaveType}`, {
            method: 'PUT',
            body: {
                leave_type_id: id,
                leave_type_name: name,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response;
    } catch (error: any) {
        console.error('Error updating leave type:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Error updating leave type',
        });
    }
});
