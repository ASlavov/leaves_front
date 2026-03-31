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
    const { userId, oldPass, newPass } = body;

    const response = await $fetch(`${config.public.apiBase}${config.public.auth.updatePassword}`, {
      method: 'PUT',
      body: {
        user_id: userId,
        old_password: oldPass,
        password: newPass,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Use the token in the Authorization header
      },
    });
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
