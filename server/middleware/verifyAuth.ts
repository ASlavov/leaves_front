// server/middleware/verifySession.ts
import { defineEventHandler, getCookie, createError } from 'h3';
import { verifyJWT } from '~/server/utils/auth';
import { setCookie } from '#imports';

export default defineEventHandler(async (event) => {
  // Check if the request path starts with `/api/auth`
  const url = event.node.req.url || '';

  if (!url.startsWith('/api')) {
    return;
  }
  if (url.startsWith('/api/auth')) {
    // Skip the middleware for this path
    return;
  }

  // Read the auth_token from the cookie
  const authToken = getCookie(event, 'auth_token');

  // If no token is present, we cannot verify. The request will proceed but event.context will not have auth data.
  if (!authToken) {
    setCookie(event, 'user_authed', 'false', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });
    return {
      statusCode: 403,
      statusMessage: 'Not authenticated',
    };
  }

  try {
    // Verify the JWT and extract the payload
    const payload = verifyJWT(authToken);

    if (!payload.userId || !payload.token) {
      setCookie(event, 'user_authed', '', { expires: new Date(0) });
      throw new Error('Invalid JWT payload');
    }

    // Attach user info to event.context for use in API handlers
    event.context.requestingUserId = payload.userId;
    event.context.token = payload.token;

    const maxAge = process.env.env === 'local' ? 60 * 60 * 24 * 365 : 60 * 15;

    setCookie(event, 'user_authed', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAge,
    });

    if (!url.startsWith('/api/notifications/get')) {
      setCookie(event, 'auth_token', authToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: maxAge,
      });
    }
  } catch (error: any) {
    console.error('JWT verification failed:', error);
    // Clear the invalid cookie to prevent repeated failures
    setCookie(event, 'auth_token', '', { expires: new Date(0) });
    setCookie(event, 'user_authed', '', { expires: new Date(0) });
    // Throw an error to block unauthorized access
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid or expired authentication token',
    });
  }
});
