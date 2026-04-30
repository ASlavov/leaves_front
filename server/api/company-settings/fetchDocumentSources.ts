import { defineEventHandler } from 'h3';
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

  try {
    const response = await $fetch(
      `${config.public.apiBase}${config.public.companySettings.documentSources}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response;
  } catch (error: any) {
    console.error('Error fetching document sources:', error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: 'Error fetching document sources',
    });
  }
});
