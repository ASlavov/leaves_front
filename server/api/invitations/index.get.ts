import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const { token, requestingUserId } = event.context;

    if (!token) {
        throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
    }

    try {
        return await $fetch(`${config.public.apiBase}${config.public.invitations.list}`, {
            method: 'GET',
            query: { user_id: requestingUserId },
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error: any) {
        throw proxyError(error);
    }
});
