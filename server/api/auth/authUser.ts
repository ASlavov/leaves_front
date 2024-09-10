import { defineEventHandler, readBody } from 'h3'; // Use h3 to handle cookies and request bodies
import { useRuntimeConfig, setCookie } from '#imports'; // Runtime config and setCookie from Nuxt
import { createSession } from '~/server/sessionStore';

export default defineEventHandler(async (event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*');
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
        });

        if (result && result !== "user not auth") {
            const {
                user_id,
                token
            } = result;  // Get userId and token from API response

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
