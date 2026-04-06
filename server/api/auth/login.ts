import { defineEventHandler, readBody } from 'h3'; // Use h3 to handle cookies and request bodies
import { useRuntimeConfig, setCookie } from '#imports'; // Runtime config and setCookie from Nuxt
import { createJWT } from '~/server/utils/auth';

interface authResponse {
  user_id: string;
  token: string;
}

// Define a union type that includes the expected object and a string for errors
type FetchResult = authResponse | string;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event); // Get login details (email, password) from the request body
  //console.log('Requesting with:', body.email, body.password);  // Log the values before making the request
  try {
    // Make a POST request to authenticate the user with the external API
    const targetUrl = `${config.public.apiBase}${config.public.auth.auth}`;
    console.log('API Target URL:', targetUrl);
    console.log('API Secret exists:', !!config.apiSecret);

    const result = (await $fetch(targetUrl, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': config.apiSecret,
        'User-Agent': 
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })) as FetchResult;

    if (typeof result === 'string') {
      throw new Error(result);
    } else {
      const { user_id, token } = result; // Get userId and token from API response

      // Use the new utility to create a JWT
      const authToken = createJWT(user_id, token);

      // Set a secure, HTTP-only cookie with the JWT
      const isSecure = process.env.NODE_ENV === 'production';
      const maxAge = config.env === 'local' ? 60 * 60 * 24 * 365 : 60 * 15;

      setCookie(event, 'auth_token', authToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        maxAge: maxAge,
      });
      setCookie(event, 'user_authed', 'true', {
        httpOnly: false,
        secure: isSecure,
        sameSite: 'strict',
        maxAge: maxAge,
      });
      return { userId: user_id, message: 'Authenticated successfully' };
    }

    throw new Error(`Authentication failed`);
  } catch (error: any) {
    // Handle authentication failure
    const status = error.response?.status || error.statusCode || 500;
    const message = error.response?._data?.message || error.message || 'Authentication failed';
    
    console.error('Authentication error details:', {
      status,
      message,
      data: error.response?._data,
      apiBase: config.public.apiBase,
    });

    throw createError({
      statusCode: 401,
      statusMessage: `Authentication failed: ${message}`,
    });
  }
});
