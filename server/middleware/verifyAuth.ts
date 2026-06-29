import { defineEventHandler, createError } from 'h3';
import { setCookie, useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const url = event.path || '';

  if (!url.startsWith('/api') || url.startsWith('/api/auth')) {
    return;
  }

  const session = await getUserSession(event);

  if (!session?.token) {
    setCookie(event, 'user_authed', 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  event.context.token = session.token;
  event.context.requestingUserId = session.userId;

  const config = useRuntimeConfig();
  const isSecure = process.env.NODE_ENV === 'production';
  const maxAge = config.env === 'local' ? 60 * 60 * 24 * 365 : 60 * 60 * 8;

  // Slide the session window forward on every active (non-notification) request.
  // setUserSession re-encrypts and re-seals the cookie with a fresh maxAge.
  if (!url.startsWith('/api/notifications/get')) {
    await setUserSession(event, { userId: session.userId, token: session.token }, { maxAge });
    setCookie(event, 'user_authed', 'true', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'strict',
      maxAge,
    });
  }
});
