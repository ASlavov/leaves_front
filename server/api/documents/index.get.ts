import { defineEventHandler, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const query = getQuery(event);

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/company-documents`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      query,
    });
    return response;
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error fetching documents' });
  }
});
