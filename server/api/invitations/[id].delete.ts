import { defineEventHandler, createError, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token, requestingUserId } = event.context;
  const id = getRouterParam(event, 'id');

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    return await $fetch(`${config.public.apiBase}${config.public.invitations.delete}/${id}`, {
      method: 'DELETE',
      body: { user_id: requestingUserId },
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw proxyError(error);
  }
});
