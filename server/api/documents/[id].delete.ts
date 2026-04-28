import { defineEventHandler, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.documents.base}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error: any) {
    console.error('Error deleting document:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error deleting document' });
  }
});
