import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

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
      hireDate,
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
        hire_date: hireDate ?? undefined,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
