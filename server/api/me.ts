import { defineEventHandler } from 'h3'; // Use h3 to handle cookies and request bodies

export default defineEventHandler(async (event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*');

    const {
        requestingUserId,
        token
    } = event.context;

    if(!requestingUserId || !token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    return {
        userId: requestingUserId,
    }
});