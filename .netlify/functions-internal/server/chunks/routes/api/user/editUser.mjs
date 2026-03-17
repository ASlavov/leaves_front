import { d as defineEventHandler, e as useRuntimeConfig, r as readBody, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const editUser = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;
  try {
    const {
      userId,
      userName,
      userEmail,
      userDepartment,
      userRole,
      userPhone,
      userInternalPhone,
      userTitle,
      userTitleDescription,
      userImage
    } = body;
    const response = await $fetch(`${config.public.apiBase}${config.public.user.edit}`, {
      method: "PUT",
      body: {
        "requesting_user_id": requestingUserId,
        "user_id": userId,
        "name": userName,
        "email": userEmail,
        "department_id": userDepartment,
        "role_id": userRole,
        "phone": userPhone,
        "internal_phone": userInternalPhone,
        "job_title": userTitle,
        "job_description": userTitleDescription,
        "profile_image": userImage
      },
      headers: {
        Authorization: `Bearer ${token}`
        // Use the token in the Authorization header
      }
    });
    return response;
  } catch (error) {
    console.error("Error editing user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error editing user"
    });
  }
});

export { editUser as default };
//# sourceMappingURL=editUser.mjs.map
