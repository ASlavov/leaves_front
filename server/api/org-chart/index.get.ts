import { defineEventHandler, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.orgChart.base}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
    });
    return response;
  } catch (error: any) {
    console.error('Error fetching org chart:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error fetching org chart' });
  }
});
