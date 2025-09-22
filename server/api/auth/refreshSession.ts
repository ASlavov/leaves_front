import { defineEventHandler, getCookie, setCookie } from 'h3';
import { getSession, createSession } from '~/server/sessionStore'; // Import session management
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    // Retrieve the session ID from the cookie
    const sessionId = getCookie(event, 'session_id');

    if (!sessionId) {
        throw createError({
            statusCode: 401,
            message: 'Session not found',
        });
    }

    // Retrieve the session from the session store
    const session = getSession(sessionId);

    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Invalid session',
        });
    }

    const {
        userId,
        token
    } = session;

    // Call the token refresh API using the existing token
    try {
        /*const refreshResult = await $fetch(`${config.public.apiBase}${config.public.auth.tokenRefresh}`, {
            method: 'POST',
            body: {
                userId: userId,
            },
            headers: {
                /!*'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,  // Send the current token
                "X-CSRF-TOKEN": config.apiSecret,*!/
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        if (!refreshResult || !refreshResult.token) {
            console.log(refreshResult);
            throw new Error('Token refresh failed');
        }*/

        // Update the session with the new token
        const newToken = session.token;
        const newSession = createSession(session.userId, newToken);  // Update the session store with the new token

        // Optionally, refresh the session ID cookie if needed
        setCookie(event, 'session_id', newSession, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        // Return the userId and other session-related data
        return {
            userId: session.userId,
        };
    } catch (error) {
        console.error('Error refreshing token:', error);
        console.log(error);
        throw createError({
            statusCode: 401,
            message: 'Token refresh failed',
        });
    }
});
