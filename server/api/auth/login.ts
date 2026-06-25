import { defineEventHandler, readBody, setCookie } from 'h3';
import { useRuntimeConfig } from '#imports';

interface AuthResponse {
  user_id: string;
  token: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  try {
    const result = await $fetch<AuthResponse>(
      `${config.public.apiBase}${config.public.auth.auth}`,
      {
        method: 'POST',
        body: { email: body.email, password: body.password },
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': config.apiSecret,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    );

    const { user_id, token } = result;
    const isSecure = process.env.NODE_ENV === 'production';
    const maxAge = config.env === 'local' ? 60 * 60 * 24 * 365 : 60 * 60 * 8;

    // Store the Sanctum token in an encrypted, sealed session cookie.
    // nuxt-auth-utils uses AES-256-GCM — the cookie value is opaque ciphertext.
    await setUserSession(event, { userId: user_id, token }, { maxAge });

    // user_authed is non-httpOnly so the client-side auth middleware can read it
    // without an extra API round-trip.
    setCookie(event, 'user_authed', 'true', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'strict',
      maxAge,
    });

    return { userId: user_id, message: 'Authenticated successfully' };
  } catch (error: any) {
    const status = error.response?.status || error.statusCode || 500;
    const message = error.response?._data?.message || error.message || 'Authentication failed';
    throw createError({ statusCode: 401, statusMessage: `Authentication failed: ${message}` });
  }
});
