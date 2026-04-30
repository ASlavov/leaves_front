import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;

  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  const body = await readBody(event);

  try {
    const response = await $fetch(
      `${config.public.apiBase}${config.public.companySettings.documentSources}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      },
    );

    return response;
  } catch (error: any) {
    console.error('Error updating document sources:', error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: 'Error updating document sources',
    });
  }
});
