import { defineEventHandler, getQuery, createError, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  const query = getQuery(event);

  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.holidays.getAll}`, {
      method: 'GET',
      query: query.year ? { year: query.year } : {},
      headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
    });
    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
