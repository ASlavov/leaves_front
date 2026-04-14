import { defineEventHandler, readBody } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event); // Get login details (email, password) from the request body
  const { userId } = body;
  const { token } = event.context;

  //console.log('userId:', userId);
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  try {
    // Use the token to make a GET request to the external API
    const response: any = await $fetch(
      `${config.public.apiBase}${config.public.leaves.getLeavesAvailableDays}/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Use the token in the Authorization header
        },
      },
    );

    if (Array.isArray(response)) {
      return response.map((entry: any) => ({
        ...entry,
        available_days:
          typeof entry.available_days === 'string'
            ? parseFloat(entry.available_days)
            : entry.available_days,
        remaining_days:
          typeof entry.remaining_days === 'string'
            ? parseFloat(entry.remaining_days)
            : entry.remaining_days,
        used_days:
          typeof entry.used_days === 'string' ? parseFloat(entry.used_days) : entry.used_days,
        entitled_days:
          typeof entry.entitled_days === 'string'
            ? parseFloat(entry.entitled_days)
            : entry.entitled_days,
      }));
    }

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
