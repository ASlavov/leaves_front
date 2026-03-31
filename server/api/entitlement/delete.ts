import { defineEventHandler, readBody } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { proxyError } from '~/server/utils/proxyError';

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
    const { entitlementId } = body;
    console.log(body);
    const response = await $fetch(
      `${config.public.apiBase}${config.public.entitlement.delete}/${entitlementId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`, // Use the token in the Authorization header
        },
      },
    );
    console.log(response);

    return response; // Return the response from the external API
  } catch (error: any) {
    throw proxyError(error);
  }
});
