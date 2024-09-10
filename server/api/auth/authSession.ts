import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import { getSession } from "~/server/sessionStore";
export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, 'session_id');  // Assuming the token is stored in cookies

    if (!sessionId) {
        return {
            authenticated: false,
            message: 'No session ID found',
        };
    }

    // Retrieve the session from the session store
    const session = getSession(sessionId);

    if (!session) {
        deleteCookie(event, 'session_id');
        return {
            authenticated: false,
            message: 'No session with the ID found',
        };
    }

    // Check if token is valid (if necessary, but this is just a session check)
    return {
        authenticated: true,
    };
});
