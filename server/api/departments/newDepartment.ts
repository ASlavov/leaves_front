import { defineEventHandler, readBody} from 'h3'; // Import cookie helper from h3
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
            groupName,
            head,
            members
        } = body;

        const response = await $fetch(`${config.public.apiBase}${config.public.departments.newDepartment}`, {
            method: 'POST',
            body: {
                name: groupName,
                head,
                users: members,
            },
            headers: {
                Authorization: `Bearer ${token}`, // Use the token in the Authorization header
            },
        });

        return response; // Return the response from the external API
    } catch (error:any) {
        // Handle errors from the external API
        console.error('Error posting department:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error posting department',
        });
    }
});
