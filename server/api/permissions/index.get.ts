import { getHeader } from 'h3';
// GET /api/permissions
// Admin only - full editable matrix
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const config = useRuntimeConfig();

  // Use requireRole here? The plan said we could proxy directly since Laravel checks it.
  // But wait, requireRole is a helper. I will add requireRole once it's created.

  const data = await $fetch(`${config.public.apiBase}${config.public.permissions.base}`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  });

  return data;
});
