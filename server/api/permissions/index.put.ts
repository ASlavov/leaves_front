// PUT /api/permissions
// Admin only
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  const config = useRuntimeConfig();
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });

  const body = await readBody(event);

  // Require admin role middleware logic could be placed here if necessary.
  await requireRole(event, ['admin']);

  const data = await $fetch(`${config.public.apiBase}/v1/permissions`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  return data;
});
