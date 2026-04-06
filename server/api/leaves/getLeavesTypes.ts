import { defineEventHandler } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const { token } = event.context;

  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  const body = await readBody(event).catch(() => ({}));
  const includeArchived = body?.includeArchived === true;

  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.getLeaveTypes}`, {
      method: 'GET',
      query: includeArchived ? { include_archived: 1 } : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response; // Return the response from the external API
  } catch (error: any) {
    // Handle errors from the external API
    console.error('Error fetching leaves:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching leaves',
    });
  }
});
