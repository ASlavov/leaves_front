import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';
import { requireRole } from '~/server/utils/requireRole';

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

  await requireRole(event, ['admin']);

  try {
    const response = await $fetch(`${config.public.apiBase}/terminate-user/${body.userId}`, {
      method: 'POST',
      body: { termination_date: body.terminationDate },
      headers: {
        Authorization: `Bearer ${token}`, // Use the token in the Authorization header
      },
    });
    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
