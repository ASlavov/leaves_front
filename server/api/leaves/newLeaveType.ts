import { defineEventHandler, readBody, createError } from 'h3';
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
        const { name, dependsOnTypeId, allowRollover } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeaveType}`, {
            method: 'POST',
            body: {
                leave_type_name: name,
                depends_on_type_id: dependsOnTypeId ?? null,
                allow_rollover: allowRollover !== false,
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        return response;
    } catch (error: any) {
        throw proxyError(error);
    }
});
