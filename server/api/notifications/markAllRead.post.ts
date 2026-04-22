// server/api/notifications/markAllRead.post.ts
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403 });

  const config = useRuntimeConfig();

  const data = await $fetch<any>(`${config.apiBase}/notifications-mark-all-read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
