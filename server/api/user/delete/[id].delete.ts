import { defineEventHandler, getRouterParam, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const id = getRouterParam(event, 'id');

  return await $fetch(`${config.public.apiBase}${config.public.user.delete}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: cookieHeader,
      'X-CSRF-TOKEN': config.apiSecret,
    },
  });
});
