import {defineEventHandler, readBody} from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);
    
    const {requestingUserId, token } = event.context;

    if (!token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Not authenticated',
        });
    }

    try {

        const {
            userId,
            leaveId,
            status,
            reason
        } = body;
/*
'leave_id'
'user_editor'
'status'
'reason'

*/
        console.log("leave_id", leaveId,
            "user_editor", requestingUserId,
            "status", status,
            "reason", reason);
        const response = await $fetch(`${config.public.apiBase}${config.public.leaves.processLeave}`, {
            method: 'PUT',
            body: {
                /*"requesting_user_id": requestingUserId,*/
                "leave_id": leaveId,
                "user_editor": requestingUserId,
                "status": status,
                "reason": reason
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        if(response === 'You cannot reject/accept your leaves') {
            throw createError({
                statusCode: 500,
                statusMessage: 'You cannot reject/accept your leaves',
            });
        }

        return response; // Return the response from the external API
    } catch (error:any) {
        // Handle errors from the external API
        console.error('Error posting leave:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error posting leaves',
        });
    }
});
