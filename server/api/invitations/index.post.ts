import { defineEventHandler, createError, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  const body = await readBody(event);

  try {
    return await $fetch(`${config.public.apiBase}${config.public.invitations.create}`, {
      method: 'POST',
      body: {
        user_id_from: body.user_id_from,
        user_id_to: body.user_id_to,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw proxyError(error);
  }
});
