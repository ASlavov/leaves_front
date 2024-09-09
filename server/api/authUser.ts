import { defineEventHandler, readBody } from 'h3'; // Use h3 to handle cookies and request bodies
import { useRuntimeConfig, setCookie } from '#imports'; // Runtime config and setCookie from Nuxt
import { createSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*');
    const config = useRuntimeConfig();
    const body = await readBody(event); // Get login details (email, password) from the request body
    console.log('Requesting with:', body.email, body.password);  // Log the values before making the request
    try {
        // Make a POST request to authenticate the user with the external API
        const result = await $fetch(`${config.public.users.apiBase}${config.public.users.auth}`, {
            method: 'POST',
            body: {
                email: body.email,
                password: body.password,
            },
            headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": config.apiSecret,
            },
            //responseType: 'text', // Use text because you mentioned the response is a string
        });

        if (result) {
            /*// Store the token securely in a cookie
            // Set expiration to 1 hour from now
            const oneHourFromNow = new Date();
            oneHourFromNow.setTime(oneHourFromNow.getTime() + (3600 * 1000)); // 3600 seconds * 1000 ms

            setCookie(event, 'auth_token', result.token, {
                expires: oneHourFromNow,
                httpOnly: true, // Ensure the cookie is HTTP-only (not accessible to JavaScript)
                sameSite: 'strict', // Enforce same-site policy
            });

            return { message: 'Authenticated successfully' }; // Respond with success message*/

            const { user_id, token } = result;  // Get userId and token from API response

            // Store the token in the session store
            const sessionId = createSession(user_id, token);

            // Set a session cookie with the sessionId (this is not the token)
            setCookie(event, 'session_id', sessionId, {
                httpOnly: true,
                sameSite: 'strict',
            });
            return {  userId: user_id, message: 'Authenticated successfully' };
        }

        throw new Error(`Authentication failed`);
    } catch (error) {
        // Handle authentication failure
        console.error('Authentication error:', error);
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication failed',
        });
    }
});
