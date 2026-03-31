import { defineEventHandler, readBody } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);

  const { token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  try {
    const { userId } = body;
    console.log(body);
    const response = await $fetch(
      `${config.public.apiBase}${config.public.entitlement.get}/${userId}`,
      {
        method: 'GET',
        query: { include_archived: 1 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response);

    return response; // Return the response from the external API
  } catch (error: any) {
    // Handle errors from the external API
    console.error('Error posting leave:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error posting leaves',
    });
  }
});
