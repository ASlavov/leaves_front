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

const getProfile = defineEventHandler(async (event) => {
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
    const { userId } = body;
    const response = await $fetch(
      `${config.public.apiBase}${config.public.user.getSingleUser}/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          // Use the token in the Authorization header
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Error posting leave:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error posting leaves',
    });
  }
});

export { getProfile as default };
//# sourceMappingURL=getProfile.mjs.map
