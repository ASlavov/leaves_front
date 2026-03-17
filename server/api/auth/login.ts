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
        const result = await $fetch(`${config.public.apiBase}${config.public.auth.auth}`, {
            method: 'POST',
            body: {
                email: body.email,
                password: body.password,
            },
            headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": config.apiSecret,
            },
        }) as FetchResult;

        if (typeof result === 'string') {
            throw new Error(result);
        } else {
            const {
                user_id,
                token
            } = result;  // Get userId and token from API response

            // Use the new utility to create a JWT
            const authToken = createJWT(user_id, token);

            // Set a secure, HTTP-only cookie with the JWT
            setCookie(event, 'auth_token', authToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 15,
            });
            setCookie(event, 'user_authed', 'true', {
                httpOnly: false,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 15,
            });
            return { userId: user_id, message: 'Authenticated successfully' };
        }

        throw new Error(`Authentication failed`);
    } catch (error: any) {
        // Handle authentication failure
        console.error('Authentication error:', error);
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication failed',
        });
    }
});
