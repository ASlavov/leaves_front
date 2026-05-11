import { getHeader } from 'h3';
// PUT /api/permissions
// Admin only
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const config = useRuntimeConfig();

  const body = await readBody(event);

  // Require admin role middleware logic could be placed here if necessary.
  await requireRole(event, ['admin']);

  const data = await $fetch(`${config.public.apiBase}${config.public.permissions.base}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
    body,
  });

  return data;
});
