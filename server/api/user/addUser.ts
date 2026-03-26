import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { token } = event.context;

    try {
        const {
            userName,
            userEmail,
            userDepartment,
            userRole,
            userPassword,
            userPhone,
            userInternalPhone,
            userTitle,
            userTitleDescription,
            userImage,
        } = body;

        const response = await $fetch(`${config.public.apiBase}/users`, {
            method: 'POST',
            body: {
                name: userName,
                email: userEmail,
                department_id: userDepartment,
                role_id: userRole,
                password: userPassword,
                phone: userPhone,
                internal_phone: userInternalPhone,
                job_title: userTitle,
                job_description: userTitleDescription,
                profile_image: userImage,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response;
    } catch (error: any) {
        console.error('Error creating user:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating user',
        });
    }
});
