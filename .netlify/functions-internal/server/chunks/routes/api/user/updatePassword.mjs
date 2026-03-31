import {
  d as defineEventHandler,
  e as useRuntimeConfig,
  r as readBody,
  h as createError,
} from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const updatePassword = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }
  try {
    const { userId, oldPass, newPass } = body;
    const response = await $fetch(`${config.public.apiBase}${config.public.user.updatePassword}`, {
      method: 'PUT',
      body: {
        user_id: userId,
        old_password: oldPass,
        password: newPass,
        requesting_user_id: requestingUserId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        // Use the token in the Authorization header
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error editing user:', error);
    throw createError({
      statusCode: 422,
      statusMessage: 'Error editing user',
    });
  }
});

export { updatePassword as default };
//# sourceMappingURL=updatePassword.mjs.map
