// server/api/broadcasting/auth.post.ts
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Laravel expects socket_id and channel_name in the body
  const data = await $fetch<any>(`${config.apiBase}/broadcasting/auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  return data;
});
