import { defineEventHandler, createError, readBody, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const id = getRouterParam(event, 'id');

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  const body = await readBody(event);

  try {
    return await $fetch(
      `${config.public.apiBase}${config.public.invitations.updateStatus}/${id}/status`,
      {
        method: 'PATCH',
        body: {
          user_id: body.user_id,
          status: body.status,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (error: any) {
    throw proxyError(error);
  }
});
