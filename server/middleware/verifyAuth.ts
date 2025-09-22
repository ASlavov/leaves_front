// server/middleware/verifySession.ts
import { defineEventHandler, getCookie, createError } from 'h3';
import { getSession } from '../sessionStore';

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

    // Read the session ID from the cookie
    const sessionId = getCookie(event, 'session_id') || '';

    if (!sessionId) {
        return {
            statusCode: 403,
            statusMessage: 'Not authenticated',
        };
    }

    // Retrieve the session from the session store
    const session = getSession(sessionId);
    if (!session) {
        return {
            statusCode: 403,
            statusMessage: 'Invalid session',
        };
    }

    const { userId, token } = session;

    if (!token || !userId) {
        return {
            statusCode: 403,
            statusMessage: 'Invalid session',
        };
    }


    // Attach user info to event.context for use in API handlers
    event.context.requestingUserId = userId;
    event.context.token = token;
});
