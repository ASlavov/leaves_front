// server/api/broadcasting/auth.post.ts
import { readRawBody, getHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  const cookieHeader = getHeader(event, 'cookie') ?? '';

  const config = useRuntimeConfig();

  // Echo/Pusher sends auth as application/x-www-form-urlencoded, NOT JSON.
  // We must forward the raw body with the correct content-type.
  const rawBody = (await readRawBody(event)) ?? '';

  const data = await $fetch(`${config.public.apiBase}/broadcasting/auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: rawBody,
  });

  return data;
});
