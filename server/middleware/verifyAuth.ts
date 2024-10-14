// server/middleware/verifySession.ts
import { defineEventHandler, getCookie, createError } from 'h3';
import { getSession, verifySession } from '../sessionStore';

export default defineEventHandler(async (event) => {
    console.log('here')
    // Check if the request path starts with `/api/auth`
    const url = event.node.req.url || '';
    console.log('url', url);
    if (!url.startsWith('/api')) {
        return;
    }
    if (url.startsWith('/api/auth')) {
        // Skip the middleware for this path
        return;
    }
    console.log('here #2')
    // Read the session ID from the cookie
    const sessionId = getCookie(event, 'session_id') || '';

    if (!sessionId) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }
    console.log('here #3')
    // Retrieve the session from the session store
    const session = getSession(sessionId);
    if (!session) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid session',
        });
    }
    console.log('here #4')
    const { userId, token } = session;

    if (!token || !userId) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid session',
        });
    }
    console.log('here #5')

    // Attach user info to event.context for use in API handlers
    event.context.requestingUserId = userId;
    event.context.token = token;
});
