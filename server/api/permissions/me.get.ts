import { getHeader } from 'h3';
// GET /api/permissions/me
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const config = useRuntimeConfig();

  const data = await $fetch(`${config.public.apiBase}${config.public.permissions.me}`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  });

  return data;
});
