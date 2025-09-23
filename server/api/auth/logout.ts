import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import {deleteSession, getSession} from "~/server/sessionStore";

export default defineEventHandler(async (event) => {
    const userAuthed = getCookie(event, 'auth_token');  // Assuming the token is stored in cookies

    if (userAuthed) {
        deleteCookie(event, 'auth_token');
        deleteCookie(event, 'user_authed');
        return {
            authenticated: false,
            message: 'Logged out',
        };
    }

    return {
        authenticated: false,
    };
});
