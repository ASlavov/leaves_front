import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const { token } = event.context;
    const body = await readBody(event);

    if (!token) {
        throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
    }

    try {
        const response = await $fetch(`${config.public.apiBase}${config.public.holidays.create}`, {
            method: 'POST',
            body: { date: body.date, name: body.name, is_recurring: body.is_recurring ?? true },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response;
    } catch (error: any) {
        throw proxyError(error);
    }
});
