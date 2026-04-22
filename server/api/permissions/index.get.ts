// GET /api/permissions
// Admin only - full editable matrix
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  const config = useRuntimeConfig();
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });

  // Use requireRole here? The plan said we could proxy directly since Laravel checks it. 
  // But wait, requireRole is a helper. I will add requireRole once it's created.

  const data = await $fetch(`${config.public.apiBase}/v1/permissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
