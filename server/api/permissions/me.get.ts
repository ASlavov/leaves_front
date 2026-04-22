// GET /api/permissions/me
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  const config = useRuntimeConfig();
  if (!token) throw createError({ statusCode: 403, message: 'Unauthenticated' });

  const data = await $fetch(`${config.public.apiBase}/v1/permissions/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
