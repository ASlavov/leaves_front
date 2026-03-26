import { defineEventHandler, readBody, createError } from 'h3';
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
        const { name } = body;

        // Map frontend payload to backend expectations
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeaveType}`, {
            method: 'POST',
            body: {
                leave_type_name: name,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response;
    } catch (error: any) {
        console.error('Error creating leave type:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Error creating leave type',
        });
    }
});
