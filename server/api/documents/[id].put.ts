import { defineEventHandler, readBody, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const id = getRouterParam(event, 'id');
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/company-documents/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    return response;
  } catch (error: any) {
    console.error('Error updating document:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error updating document' });
  }
});
