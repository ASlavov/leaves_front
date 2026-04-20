import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/company-documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    return response;
  } catch (error: any) {
    console.error('Error creating document:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error creating document' });
  }
});
