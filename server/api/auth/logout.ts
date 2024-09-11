import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import {deleteSession, getSession} from "~/server/sessionStore";

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, 'session_id');  // Assuming the token is stored in cookies

    if (sessionId) {
        const session = getSession(sessionId);
        if (session) {
            deleteSession(sessionId);
        }
        deleteCookie(event, 'session_id');
        return {
            authenticated: false,
            message: 'Logged out',
        };
    }

    return {
        authenticated: false,
    };
});
